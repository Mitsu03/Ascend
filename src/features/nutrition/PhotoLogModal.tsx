import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, IconButton } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { Badge, Field, Select, TextInput } from '@/components/ui/Misc'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import {
  VisionNotConfiguredError,
  VisionRequestError,
  recogniseFood,
  visionIsConfigured,
} from '@/services/foodVision'
import {
  BarcodeIncompleteError,
  BarcodeNotFoundError,
  barcodeScanningIsSupported,
  createBarcodeDetector,
  isValidBarcode,
  lookupBarcode,
} from '@/services/openFoodFacts'
import { isNative } from '@/lib/native'
import {
  cameraIsSupported,
  captureFrame,
  captureWithNativeCamera,
  fileToImages,
  openCamera,
  pickFromNativeGallery,
} from '@/services/photos'
import { MEAL_ORDER, checkProteinBonus, useNutritionStore } from '@/store/nutritionStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import type { FoodGuess } from '@/services/foodVision'
import type { Food, MealType } from '@/types'

type Mode = 'foto' | 'codigo'
type Status = 'idle' | 'camera' | 'analysing' | 'results' | 'error'

interface PhotoLogModalProps {
  open: boolean
  onClose: () => void
  mealType: MealType
}

interface Selection extends FoodGuess {
  chosen: boolean
}

export function PhotoLogModal({ open, onClose, mealType }: PhotoLogModalProps) {
  const { t, n, loc, lang } = useI18n()
  const vision = useSettingsStore((state) => state.vision)
  const targets = useUserStore((state) => state.targets)
  const addEntry = useNutritionStore((state) => state.addEntry)

  const videoRef = useRef<HTMLVideoElement>(null)
  const stopCameraRef = useRef<(() => void) | null>(null)
  /** Análise em curso, para o botão de cancelar e para o fecho do modal. */
  const analysisRef = useRef<AbortController | null>(null)
  const scanTimerRef = useRef<number | null>(null)

  const [mode, setMode] = useState<Mode>('foto')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [selections, setSelections] = useState<Selection[]>([])
  const [selectedMeal, setSelectedMeal] = useState<MealType>(mealType)
  const [manualCode, setManualCode] = useState('')

  const configured = visionIsConfigured(vision)

  const cancelAnalysis = useCallback(() => {
    analysisRef.current?.abort()
    analysisRef.current = null
  }, [])

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }
    stopCameraRef.current?.()
    stopCameraRef.current = null
  }, [])

  const reset = useCallback(() => {
    stopCamera()
    cancelAnalysis()
    setStatus('idle')
    setError(null)
    setThumbnail(null)
    setSelections([])
    setManualCode('')
  }, [cancelAnalysis, stopCamera])

  useEffect(() => {
    if (open) {
      setSelectedMeal(mealType)
      setMode('foto')
      reset()
    } else {
      stopCamera()
    }
  }, [open, mealType, reset, stopCamera])

  useEffect(() => stopCamera, [stopCamera])

  const registerFood = (food: Food, grams: number, options?: { photo?: string; photoGroupId?: string }) => {
    addEntry(selectedMeal, food, grams, options)
    checkProteinBonus(targets)
  }

  // ------------------------------------------------------------- Fotografia

  const analyse = async (images: { thumbnail: string; analysis: string }) => {
    setThumbnail(images.thumbnail)
    if (!configured) {
      // Sem endpoint configurado a foto fica anexada e o utilizador escolhe à mão.
      setStatus('results')
      setSelections([])
      return
    }
    setStatus('analysing')
    const controller = new AbortController()
    analysisRef.current = controller
    try {
      const guesses = await recogniseFood(images.analysis, vision, lang, controller.signal)
      setSelections(guesses.map((guess) => ({ ...guess, chosen: true })))
      setStatus('results')
      if (guesses.length === 0) setError(t.photoLog.noFoodFound)
    } catch (cause) {
      // Cancelamento pedido pelo utilizador não é falha: a foto fica anexada e
      // ele escolhe os alimentos à mão, como no modo sem endpoint.
      if (controller.signal.aborted) {
        setStatus('results')
        setSelections([])
        return
      }
      setStatus('error')
      if (cause instanceof VisionNotConfiguredError) {
        setError(t.photoLog.notConfigured)
      } else if (cause instanceof VisionRequestError && cause.detail) {
        setError(`${t.photoLog.analysisFailed} ${t.photoLog.visionErrorDetail(cause.detail)}`)
      } else {
        setError(t.photoLog.analysisFailed)
      }
    } finally {
      if (analysisRef.current === controller) analysisRef.current = null
    }
  }

  const startCamera = async () => {
    setError(null)

    // No wrapper nativo abre-se a câmara do sistema: a pré-visualização dentro
    // da webview fica preta (ver `captureWithNativeCamera`).
    if (isNative && mode === 'foto') {
      try {
        const images = await captureWithNativeCamera()
        if (images) void analyse(images)
      } catch {
        setStatus('error')
        setError(t.photoLog.cameraDenied)
      }
      return
    }

    try {
      const { stream, stop } = await openCamera()
      stopCameraRef.current = stop
      setStatus('camera')
      // O elemento <video> só existe depois do próximo render.
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play()
          if (mode === 'codigo') startBarcodeLoop()
        }
      }, 0)
    } catch {
      setStatus('error')
      setError(t.photoLog.cameraDenied)
    }
  }

  const takePhoto = () => {
    if (!videoRef.current) return
    const images = captureFrame(videoRef.current)
    stopCamera()
    void analyse(images)
  }

  /** Galeria do sistema no wrapper nativo; no browser é o `<input type="file">`. */
  const openGallery = async () => {
    setError(null)
    try {
      const images = await pickFromNativeGallery()
      if (images) void analyse(images)
    } catch {
      setStatus('error')
      setError(t.photoLog.readFailed)
    }
  }

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    try {
      const images = await fileToImages(file)
      void analyse(images)
    } catch {
      setStatus('error')
      setError(t.photoLog.readFailed)
    }
  }

  // -------------------------------------------------------- Código de barras

  const handleBarcode = useCallback(
    async (code: string) => {
      stopCamera()
      setStatus('analysing')
      setError(null)
      try {
        const { food, brand } = await lookupBarcode(code)
        setSelections([
          {
            food,
            grams: food.commonPortionG,
            rawLabel: brand ? `${loc(food.name)} · ${brand}` : loc(food.name),
            synthetic: true,
            chosen: true,
          },
        ])
        setStatus('results')
      } catch (cause) {
        setStatus('error')
        if (cause instanceof BarcodeNotFoundError) setError(t.photoLog.barcodeNotFound)
        else if (cause instanceof BarcodeIncompleteError) setError(t.photoLog.barcodeIncomplete)
        else setError(t.photoLog.barcodeFailed)
      }
    },
    [loc, stopCamera, t],
  )

  const startBarcodeLoop = () => {
    const detector = createBarcodeDetector()
    if (!detector) return
    scanTimerRef.current = window.setInterval(async () => {
      const video = videoRef.current
      if (!video || video.readyState < 2) return
      try {
        const found = await detector.detect(video)
        const code = found[0]?.rawValue
        if (code && isValidBarcode(code)) {
          void handleBarcode(code)
        }
      } catch {
        /* fotograma ilegível — tenta no próximo intervalo */
      }
    }, 700)
  }

  // ------------------------------------------------------------------- Ações

  const toggle = (index: number) =>
    setSelections((current) =>
      current.map((item, i) => (i === index ? { ...item, chosen: !item.chosen } : item)),
    )

  const setGrams = (index: number, grams: number) =>
    setSelections((current) =>
      current.map((item, i) => (i === index ? { ...item, grams: Math.max(1, grams) } : item)),
    )

  const confirm = () => {
    const chosen = selections.filter((item) => item.chosen)
    // Todos os alimentos desta fotografia partilham um grupo: a miniatura fica
    // guardada uma só vez (duplicá-la esgotava a quota do storage) mas o diário
    // mostra-a à frente do grupo inteiro, não só do primeiro alimento.
    const photoGroupId = thumbnail ? `photo-${Date.now()}` : undefined
    chosen.forEach((item, index) => {
      registerFood(item.food, item.grams, {
        photo: index === 0 ? (thumbnail ?? undefined) : undefined,
        photoGroupId,
      })
    })
    onClose()
  }

  const chosenCount = selections.filter((item) => item.chosen).length
  const modes: { value: Mode; label: string; icon: string }[] = [
    { value: 'foto', label: t.photoLog.modePhoto, icon: 'Camera' },
    { value: 'codigo', label: t.photoLog.modeBarcode, icon: 'ScanBarcode' },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.photoLog.title}
      description={t.photoLog.description}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-muted">
            {selections.length > 0 ? t.photoLog.selectedCount(chosenCount) : t.photoLog.footerHint}
          </span>
          <div className="flex gap-2">
            <Button onClick={onClose}>{t.common.cancel}</Button>
            <Button variant="primary" icon="Check" onClick={confirm} disabled={chosenCount === 0}>
              {t.photoLog.register}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {modes.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={mode === item.value}
                onClick={() => {
                  setMode(item.value)
                  reset()
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  mode === item.value
                    ? 'border-ember/60 bg-ember/10 text-ember'
                    : 'border-void-600 text-ink-muted hover:text-ink',
                )}
              >
                <Icon name={item.icon} size={14} />
                {item.label}
              </button>
            ))}
          </div>
          <div className="min-w-44">
            <Field label={t.nutrition.mealLabel}>
              {(id) => (
                <Select
                  id={id}
                  value={selectedMeal}
                  onChange={(event) => setSelectedMeal(event.target.value as MealType)}
                >
                  {MEAL_ORDER.map((meal) => (
                    <option key={meal} value={meal}>
                      {t.meals[meal]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </div>

        {/* Aviso, não nota de rodapé: sem chave o "Registar" nunca liga, e antes
            disto o utilizador só descobria isso ao carregar num botão inerte.
            Sem condição de `status` para continuar visível depois da foto. */}
        {mode === 'foto' && !configured && (
          <p className="flex items-start gap-2 rounded-xl border border-warn/40 bg-warn/5 p-3 text-sm leading-relaxed text-ink">
            <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0 text-warn" />
            {t.photoLog.manualModeNote}
          </p>
        )}

        {mode === 'codigo' && !barcodeScanningIsSupported() && (
          <p className="rounded-xl border border-void-600 bg-void-900/50 p-3 text-xs leading-relaxed text-ink-muted">
            {t.photoLog.barcodeUnsupported}
          </p>
        )}

        {status === 'camera' && (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-void-600 bg-void-950">
              <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full object-cover" />
              {mode === 'codigo' && (
                <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-xl border-2 border-ember/70" />
              )}
            </div>
            {mode === 'foto' ? (
              <Button variant="primary" icon="Camera" fullWidth onClick={takePhoto}>
                {t.photoLog.takePhoto}
              </Button>
            ) : (
              <p className="text-center text-xs text-ink-muted">{t.photoLog.pointAtBarcode}</p>
            )}
            <Button fullWidth onClick={reset}>
              {t.common.cancel}
            </Button>
          </div>
        )}

        {status === 'idle' && (
          <div className="flex flex-wrap gap-2">
            {cameraIsSupported() && (mode === 'foto' || barcodeScanningIsSupported()) && (
              <Button variant="primary" icon="Camera" onClick={startCamera}>
                {mode === 'foto' ? t.photoLog.openCamera : t.photoLog.scanBarcode}
              </Button>
            )}
            {mode === 'foto' &&
              (isNative ? (
                <Button icon="Image" onClick={openGallery}>
                  {t.photoLog.chooseFile}
                </Button>
              ) : (
                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-void-500 bg-void-700/60 px-4 text-sm text-ink transition-colors hover:bg-void-700">
                  <Icon name="Image" size={17} />
                  {t.photoLog.chooseFile}
                  {/* Sem `capture`: este botão é a galeria, não a câmara. */}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => void pickFile(event.target.files?.[0])}
                  />
                </label>
              ))}
            {mode === 'codigo' && (
              <div className="flex w-full gap-2 sm:w-auto">
                <TextInput
                  value={manualCode}
                  inputMode="numeric"
                  placeholder={t.photoLog.barcodePlaceholder}
                  aria-label={t.photoLog.barcodePlaceholder}
                  onChange={(event) => setManualCode(event.target.value)}
                />
                <Button
                  icon="Search"
                  disabled={!isValidBarcode(manualCode)}
                  onClick={() => void handleBarcode(manualCode)}
                >
                  {t.photoLog.lookup}
                </Button>
              </div>
            )}
          </div>
        )}

        {status === 'analysing' && (
          <div className="flex items-center gap-3 rounded-xl border border-ember/35 bg-ember/5 p-4">
            <Icon name="Sparkles" size={18} className="animate-pulse-glow text-ember" />
            <p className="flex-1 text-sm text-ink">{t.photoLog.analysing}</p>
            <Button size="sm" onClick={cancelAnalysis}>
              {t.common.cancel}
            </Button>
          </div>
        )}

        {error && (
          <p className="flex items-start gap-2 rounded-xl border border-warn/40 bg-warn/5 p-3 text-sm text-ink">
            <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0 text-warn" />
            {error}
          </p>
        )}

        {thumbnail && (
          <div className="flex items-start gap-3">
            <img
              src={thumbnail}
              alt={t.photoLog.photoAlt}
              className="size-24 shrink-0 rounded-xl border border-void-600 object-cover"
            />
            <div className="min-w-0 flex-1 text-xs leading-relaxed text-ink-muted">
              {selections.length > 0 ? t.photoLog.checkEstimates : t.photoLog.attachedOnly}
              <Button size="sm" variant="ghost" className="mt-2" icon="RefreshCw" onClick={reset}>
                {t.photoLog.retake}
              </Button>
            </div>
          </div>
        )}

        {selections.length > 0 && (
          <ul className="space-y-2">
            {selections.map((item, index) => (
              <li
                key={`${item.food.id}-${index}`}
                className={cn(
                  'rounded-xl border p-3 transition-colors',
                  item.chosen ? 'border-ember/50 bg-ember/5' : 'border-void-600 bg-void-800/40',
                )}
              >
                <div className="flex items-center gap-3">
                  <IconButton
                    icon={item.chosen ? 'Check' : 'Circle'}
                    label={loc(item.food.name)}
                    size="sm"
                    variant={item.chosen ? 'primary' : 'secondary'}
                    onClick={() => toggle(index)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{loc(item.food.name)}</p>
                    <p className="text-xs text-ink-faint">
                      {n(Math.round((item.food.per100g.calories * item.grams) / 100))} {t.units.kcal} ·{' '}
                      {t.macros.protein} {Math.round((item.food.per100g.proteinG * item.grams) / 100)}{' '}
                      {t.units.grams}
                      {item.confidence !== undefined && ` · ${Math.round(item.confidence * 100)}%`}
                    </p>
                  </div>
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-muted">
                    <input
                      type="number"
                      min={1}
                      value={item.grams}
                      onChange={(event) => setGrams(index, Number(event.target.value))}
                      className="w-20 rounded-lg border border-void-600 bg-void-900 px-2 py-1 text-center text-ink"
                      aria-label={t.photoLog.gramsAria(loc(item.food.name))}
                    />
                    {t.units.grams}
                  </label>
                </div>
                {item.synthetic && (
                  <Badge tone="warn" className="mt-2">
                    {t.photoLog.estimatedValues}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="flex items-start gap-2 rounded-xl border border-void-600 bg-void-900/50 p-3 text-xs leading-relaxed text-ink-faint">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          {t.photoLog.disclaimer}
        </p>
      </div>
    </Modal>
  )
}
