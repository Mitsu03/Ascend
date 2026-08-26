import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArtIcon } from '@/components/ArtIcon'
import { DivisionSeal } from '@/components/DivisionSeal'
import { AVATAR_VARIANT_COUNT, HeroAvatar } from '@/components/HeroAvatar'
import { SpiritMotes } from '@/components/art/SpiritArt'
import { useHeroTitle } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, Disclaimer, Field, OptionCard, Select, Stat, TextInput } from '@/components/ui/Misc'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/Progress'
import { AchievementsGrid } from '@/features/profile/AchievementsGrid'
import { ArtworkPanel } from '@/features/profile/ArtworkPanel'
import { InventoryPanel } from '@/features/profile/InventoryPanel'
import { ProgressCharts, WeightChart } from '@/features/profile/ProgressCharts'
import { AVATAR_EMBLEMS, EMBLEM_FAMILY_ORDER } from '@/data/avatarEmblems'
import { DIVISIONS, getDivision } from '@/data/divisions'
import { LANGUAGES, LANGUAGE_NAMES, useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { computeTargets, levelFromXp, maskStageForLevel, titleKeyForLevel } from '@/services/calculations'
import { formatShortDate, today } from '@/services/dates'
import { visionIsConfigured } from '@/services/foodVision'
import { VISION_PRESETS, presetForEndpoint } from '@/services/visionProviders'
import { resetEverything } from '@/services/session'
import { useBodyStore } from '@/store/bodyStore'
import { useGameStore } from '@/store/gameStore'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import { DEFAULT_VISION_ENDPOINT, DEFAULT_VISION_MODEL, useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'
import type { ArtIconName } from '@/data/artIcons'
import type { AttributeKey, DietPreference, Goal, UserProfile } from '@/types'

/**
 * As quatro artes de combate do Gotei, cada uma com o seu emblema:
 * zanjutsu é a lâmina, hohō é o passo rápido, kidō é o feitiço e reiryoku é
 * o poder espiritual em bruto.
 */
const ATTRIBUTES: { key: AttributeKey; emblem: ArtIconName; tone: 'ember' | 'good' | 'crimson' | 'gold' }[] = [
  { key: 'forca', emblem: 'katana', tone: 'ember' },
  { key: 'resistencia', emblem: 'quick-slash', tone: 'good' },
  { key: 'disciplina', emblem: 'fire-ray', tone: 'crimson' },
  { key: 'energia', emblem: 'aura', tone: 'gold' },
]

const ATTRIBUTE_COLORS: Record<string, string> = {
  ember: 'text-ember',
  good: 'text-good',
  crimson: 'text-crimson-soft',
  gold: 'text-gold',
}

/** Matizes disponíveis para o cabelo do avatar. */
const AVATAR_HUES = [24, 0, 320, 268, 200, 172, 145, 48]

/** Índices dos penteados, derivados do próprio componente do avatar. */
const AVATAR_VARIANTS = Array.from({ length: AVATAR_VARIANT_COUNT }, (_, index) => index)

const GOAL_ORDER: Goal[] = ['perder_gordura', 'ganhar_massa', 'manter', 'condicao_fisica']
const DIET_ORDER: DietPreference[] = ['sem_preferencia', 'mediterranica', 'vegetariano', 'vegan']

function AvatarCard() {
  const { t, n, loc } = useI18n()
  const profile = useUserStore((state) => state.profile)!
  const setAvatar = useUserStore((state) => state.setAvatar)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const xp = useGameStore((state) => state.xp)
  const coins = useGameStore((state) => state.coins)
  const equipped = useGameStore((state) => state.equipped)
  const info = levelFromXp(xp)
  const title = useHeroTitle(info.level)
  const division = getDivision(profile.divisionId)

  const emblemId = profile.avatarEmblem as ArtIconName | undefined
  /*
   * A máscara existe a partir da patente 10 e é o utilizador que decide se a
   * usa. `showMask` está ausente nos perfis criados antes desta versão, e
   * nesses a máscara aparece — é o que dá sentido ao desbloqueio.
   */
  const unlockedStage = maskStageForLevel(info.level)
  const wearsMask = profile.showMask !== false
  const maskStage = wearsMask ? unlockedStage : undefined

  return (
    <Card glow="crimson" edge className="relative overflow-hidden">
      <SpiritMotes count={5} />
      <div className="art-layer ink-grain" />

      <CardBody className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-3">
          <HeroAvatar
            size={156}
            variant={profile.avatarVariant}
            hue={profile.avatarHue}
            frameId={equipped.frame}
            auraId={equipped.aura}
            maskStage={maskStage}
            emblemId={emblemId}
            divisionId={division.id}
          />

          {/* Figura desenhada ou brasão de esquadrão */}
          <div
            className="flex rounded-lg border border-void-600 p-0.5"
            role="group"
            aria-label={t.profile.avatarModeTitle}
          >
            <button
              type="button"
              aria-pressed={!emblemId}
              onClick={() => updateProfile({ avatarEmblem: undefined })}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                emblemId ? 'text-ink-muted hover:text-ink' : 'bg-ember/15 text-ember',
              )}
            >
              {t.profile.avatarModeDrawn}
            </button>
            <button
              type="button"
              aria-pressed={Boolean(emblemId)}
              onClick={() => updateProfile({ avatarEmblem: emblemId ?? AVATAR_EMBLEMS[0].id })}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                emblemId ? 'bg-ember/15 text-ember' : 'text-ink-muted hover:text-ink',
              )}
            >
              {t.profile.avatarModeEmblem}
            </button>
          </div>

          {emblemId ? (
            <div className="max-h-56 w-full max-w-64 space-y-2 overflow-y-auto pr-1">
              {EMBLEM_FAMILY_ORDER.map((family) => (
                <div key={family}>
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-ink-faint">
                    {t.profile.emblemFamilies[family]}
                  </p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {AVATAR_EMBLEMS.filter((emblem) => emblem.family === family).map((emblem) => (
                      <button
                        key={emblem.id}
                        type="button"
                        title={loc(emblem.name)}
                        aria-label={loc(emblem.name)}
                        aria-pressed={emblemId === emblem.id}
                        onClick={() => updateProfile({ avatarEmblem: emblem.id })}
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg border transition-colors',
                          emblemId === emblem.id
                            ? 'border-ember bg-ember/15 text-ember'
                            : 'border-void-600 text-ink-muted hover:border-void-500 hover:text-ink',
                        )}
                      >
                        <ArtIcon name={emblem.id} size={20} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-1.5">
                {AVATAR_VARIANTS.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    aria-label={t.profile.hairAria(variant + 1)}
                    aria-pressed={profile.avatarVariant === variant}
                    onClick={() => setAvatar(variant, profile.avatarHue)}
                    className={cn(
                      'size-8 rounded-lg border text-xs font-semibold transition-colors',
                      profile.avatarVariant === variant
                        ? 'border-ember bg-ember/15 text-ember'
                        : 'border-void-600 text-ink-muted hover:border-void-500 hover:text-ink',
                    )}
                  >
                    {variant + 1}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {AVATAR_HUES.map((hue) => (
                  <button
                    key={hue}
                    type="button"
                    aria-label={t.profile.colourAria(hue)}
                    aria-pressed={profile.avatarHue === hue}
                    onClick={() => setAvatar(profile.avatarVariant, hue)}
                    className={cn(
                      'size-6 rounded-full border-2 transition-transform',
                      profile.avatarHue === hue ? 'scale-110 border-ink' : 'border-transparent hover:scale-105',
                    )}
                    style={{ background: `hsl(${hue} 78% 54%)` }}
                  />
                ))}
              </div>

              {/* A máscara só se liga depois de a patente a desbloquear. */}
              {unlockedStage ? (
                <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
                  <input
                    type="checkbox"
                    checked={wearsMask}
                    onChange={(event) => updateProfile({ showMask: event.target.checked })}
                    className="size-3.5 accent-[var(--color-ember)]"
                  />
                  {t.profile.maskShow}
                  <span className="text-ink-faint">· {t.profile.maskStages[unlockedStage]}</span>
                </label>
              ) : (
                <p className="text-center text-[11px] text-ink-faint">{t.profile.maskLocked(10)}</p>
              )}
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <DivisionSeal divisionId={division.id} size={46} />
            <div className="min-w-0">
              <h1 className="text-glow-ember font-display text-4xl font-bold leading-tight text-ink">{profile.name}</h1>
              <p className="mt-1 flex items-center justify-center gap-2 text-ember-soft sm:justify-start">
                <span className="h-px w-6 bg-gradient-to-r from-ember to-transparent" aria-hidden="true" />
                {title}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-ink-muted">{t.rankNotes[titleKeyForLevel(info.level)]}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge tone="ember" icon="TrendingUp">
              {t.common.levelWithNumber(info.level)}
            </Badge>
            <Badge tone="gold" icon="Coins">
              {n(coins)}
            </Badge>
            <Badge tone="neutral" icon="Target">
              {t.goals[profile.goal]}
            </Badge>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">{t.common.levelProgress}</span>
              <span className="tabular-nums text-ink-faint">
                {t.common.xpProgress(n(info.currentLevelXp), n(info.nextLevelXp))}
              </span>
            </div>
            <ProgressBar
              value={info.currentLevelXp}
              max={info.nextLevelXp}
              tone="xp"
              height="lg"
              showShimmer
              label={t.common.levelProgress}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

/** Painel da divisão: função, lema e pedido de transferência para outra. */
function DivisionPanel() {
  const { t, loc } = useI18n()
  const profile = useUserStore((state) => state.profile)!
  const updateProfile = useUserStore((state) => state.updateProfile)
  const division = getDivision(profile.divisionId)

  return (
    <Card>
      <CardHeader title={t.profile.divisionTitle} subtitle={t.profile.divisionSubtitle} icon="Shield" />
      <CardBody className="space-y-4 pt-3">
        <div className="flex items-center gap-4">
          <DivisionSeal divisionId={division.id} size={64} />
          <div className="min-w-0">
            <p className="font-display text-xl font-bold text-ink">{loc(division.name)}</p>
            <p className="text-sm text-ink-muted">{loc(division.role)}</p>
            <p className="mt-1 text-sm italic text-ink-faint">“{loc(division.motto)}”</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink-muted">{t.profile.divisionPick}</p>
          <div className="flex flex-wrap gap-2">
            {DIVISIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                title={loc(option.name)}
                aria-label={loc(option.name)}
                aria-pressed={option.id === division.id}
                onClick={() => updateProfile({ divisionId: option.id })}
                className={cn(
                  'rounded-xl border p-1 transition-colors',
                  option.id === division.id ? 'border-ember bg-ember/10' : 'border-void-600 hover:border-void-500',
                )}
              >
                <DivisionSeal divisionId={option.id} size={40} />
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">{t.profile.divisionPickHint}</p>
        </div>
      </CardBody>
    </Card>
  )
}


function AttributesCard() {
  const { t } = useI18n()
  const attributes = useGameStore((state) => state.attributes)
  const max = Math.max(10, ...Object.values(attributes))

  return (
    <Card>
      <CardHeader title={t.profile.attributesTitle} subtitle={t.profile.attributesSubtitle} icon="Shield" />
      <CardBody className="space-y-4 pt-3">
        {ATTRIBUTES.map((attribute) => (
          <div key={attribute.key}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <ArtIcon name={attribute.emblem} size={17} className={ATTRIBUTE_COLORS[attribute.tone]} />
                {t.attributes[attribute.key]}
              </span>
              <span className={cn('font-display text-lg font-bold tabular-nums', ATTRIBUTE_COLORS[attribute.tone])}>
                {attributes[attribute.key]}
              </span>
            </div>
            <ProgressBar
              value={attributes[attribute.key]}
              max={max}
              tone={attribute.tone}
              height="sm"
              className="mt-1.5"
              label={t.attributes[attribute.key]}
            />
            <p className="mt-1 text-[11px] text-ink-faint">{t.attributeHints[attribute.key]}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}

function StatsCard() {
  const { t } = useI18n()
  const counters = useGameStore((state) => state.counters)
  const bestStreak = useGameStore((state) => state.bestStreak)
  const streak = useGameStore((state) => state.streak)
  const history = useWorkoutStore((state) => state.history)

  const totalMinutes = Math.round(history.reduce((sum, log) => sum + log.durationSeconds, 0) / 60)

  return (
    <Card>
      <CardHeader title={t.profile.statsTitle} subtitle={t.profile.statsSubtitle} icon="Award" />
      <CardBody className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
        <Stat label={t.profile.statWorkouts} value={counters.workouts} icon="Dumbbell" tone="ember" />
        <Stat label={t.profile.statQuests} value={counters.quests} icon="Target" tone="crimson" />
        <Stat label={t.profile.statMeals} value={counters.meals} icon="UtensilsCrossed" />
        <Stat label={t.profile.statStreak} value={`${streak} d`} icon="Flame" tone="gold" />
        <Stat label={t.profile.statBestStreak} value={`${bestStreak} d`} icon="Trophy" tone="gold" />
        <Stat label={t.profile.statTotalTime} value={`${totalMinutes} ${t.units.min}`} icon="Clock" tone="ember" />
      </CardBody>
    </Card>
  )
}

function BodyProgressCard() {
  const { t, d } = useI18n()
  const logs = useBodyStore((state) => state.logs)
  const addLog = useBodyStore((state) => state.addLog)
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')

  const latest = logs[logs.length - 1]
  const first = logs[0]
  const delta = latest && first ? latest.weightKg - first.weightKg : 0

  const submit = () => {
    const weightKg = Number(weight)
    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) return
    const waistCm = Number(waist)
    addLog({
      date: today(),
      weightKg,
      waistCm: Number.isFinite(waistCm) && waistCm > 0 ? waistCm : undefined,
    })
    setWeight('')
    setWaist('')
  }

  return (
    <Card>
      <CardHeader
        title={t.profile.bodyTitle}
        subtitle={latest ? t.profile.lastWeighIn(formatShortDate(latest.date)) : t.profile.noWeighIns}
        icon="Scale"
        action={
          logs.length > 1 ? (
            <Badge tone={delta <= 0 ? 'good' : 'warn'} icon="TrendingUp">
              {delta > 0 ? '+' : ''}
              {d(delta)} kg
            </Badge>
          ) : undefined
        }
      />
      <CardBody className="space-y-4 pt-3">
        <WeightChart />

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label={t.profile.weightLabel}>
            {(id) => (
              <TextInput
                id={id}
                type="number"
                step="0.1"
                inputMode="decimal"
                placeholder="74,0"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
            )}
          </Field>
          <Field label={t.profile.waistLabel}>
            {(id) => (
              <TextInput
                id={id}
                type="number"
                step="0.5"
                inputMode="decimal"
                placeholder="81"
                value={waist}
                onChange={(event) => setWaist(event.target.value)}
              />
            )}
          </Field>
          <Button variant="primary" icon="Plus" onClick={submit} disabled={!weight}>
            {t.profile.register}
          </Button>
        </div>

        {logs.length > 0 && (
          <ul className="space-y-1.5">
            {[...logs]
              .reverse()
              .slice(0, 5)
              .map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-void-600 bg-void-800/40 px-3 py-2 text-sm"
                >
                  <span className="text-ink-muted">{formatShortDate(log.date)}</span>
                  <span className="tabular-nums text-ink">
                    {d(log.weightKg)} kg
                    {log.waistCm ? ` · ${d(log.waistCm)} cm` : ''}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}

function VisionSettingsCard() {
  const { t, loc } = useI18n()
  const vision = useSettingsStore((state) => state.vision)
  const setVision = useSettingsStore((state) => state.setVision)
  const active = visionIsConfigured(vision)

  const [endpoint, setEndpoint] = useState(vision?.endpoint ?? DEFAULT_VISION_ENDPOINT)
  const [model, setModel] = useState(vision?.model ?? DEFAULT_VISION_MODEL)
  const [apiKey, setApiKey] = useState(vision?.apiKey ?? '')

  const preset = presetForEndpoint(endpoint)

  const applyPreset = (id: string) => {
    const chosen = VISION_PRESETS.find((item) => item.id === id)
    if (!chosen) return
    setEndpoint(chosen.endpoint)
    setModel(chosen.suggestedModel)
  }

  const save = () => setVision({ endpoint: endpoint.trim(), model: model.trim(), apiKey: apiKey.trim() })

  const clear = () => {
    setVision(null)
    setApiKey('')
  }

  return (
    <Card>
      <CardHeader
        title={t.photoLog.visionTitle}
        subtitle={t.photoLog.visionHint}
        icon="Camera"
        action={
          <Badge tone={active ? 'good' : 'neutral'} icon={active ? 'CheckCircle2' : 'Circle'}>
            {active ? t.photoLog.visionEnabled : t.photoLog.visionDisabled}
          </Badge>
        }
      />
      <CardBody className="space-y-4 pt-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-ink-muted">{t.photoLog.visionProvider}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {VISION_PRESETS.map((item) => (
              <OptionCard
                key={item.id}
                selected={preset?.id === item.id}
                onSelect={() => applyPreset(item.id)}
                icon={item.free ? 'Sparkles' : 'Coins'}
                title={`${item.name} · ${item.free ? t.photoLog.visionFree : t.photoLog.visionPaid}`}
                description={loc(item.note)}
              />
            ))}
          </div>
          {preset && (
            <a
              href={preset.keyUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ember hover:underline"
            >
              {t.photoLog.visionGetKey}
              <Icon name="ArrowRight" size={14} />
            </a>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.photoLog.visionEndpoint}>
            {(id) => (
              <TextInput
                id={id}
                value={endpoint}
                placeholder={DEFAULT_VISION_ENDPOINT}
                onChange={(event) => setEndpoint(event.target.value)}
              />
            )}
          </Field>
          <Field
            label={t.photoLog.visionModel}
            hint={!model.trim() ? t.photoLog.visionModelRequired : undefined}
          >
            {(id) => (
              <TextInput
                id={id}
                value={model}
                placeholder={t.photoLog.visionModelPlaceholder}
                onChange={(event) => setModel(event.target.value)}
              />
            )}
          </Field>
        </div>
        <Field label={t.photoLog.visionKey} hint={t.photoLog.visionKeyInBrowser}>
          {(id) => (
            <TextInput
              id={id}
              type="password"
              value={apiKey}
              autoComplete="off"
              placeholder="sk-…"
              onChange={(event) => setApiKey(event.target.value)}
            />
          )}
        </Field>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon="Check"
            onClick={save}
            disabled={!apiKey.trim() || !model.trim() || !endpoint.trim()}
          >
            {t.photoLog.visionSave}
          </Button>
          {active && (
            <Button variant="danger" icon="X" onClick={clear}>
              {t.photoLog.visionClear}
            </Button>
          )}
        </div>

        <p className="flex items-start gap-2 rounded-xl border border-void-600 bg-void-900/50 p-3 text-xs leading-relaxed text-ink-faint">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          {t.photoLog.barcodeSourceNote}
        </p>
      </CardBody>
    </Card>
  )
}

function SettingsCard() {
  const navigate = useNavigate()
  const { t, n } = useI18n()
  const profile = useUserStore((state) => state.profile)!
  const targets = useUserStore((state) => state.targets)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const isDemo = useUserStore((state) => state.isDemo)
  const language = useSettingsStore((state) => state.language)
  const setLanguage = useSettingsStore((state) => state.setLanguage)

  const [editing, setEditing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [draft, setDraft] = useState(profile)

  const openEdit = () => {
    setDraft(profile)
    setEditing(true)
  }

  const save = () => {
    updateProfile(draft)
    setEditing(false)
  }

  const preview = computeTargets(draft as UserProfile)

  const fields: [string, string][] = [
    [t.profile.fieldGoal, t.goals[profile.goal]],
    [t.profile.fieldDaysPerWeek, String(profile.daysPerWeek)],
    [t.profile.fieldWeight, `${profile.weightKg} kg`],
    [t.profile.fieldHeight, `${profile.heightCm} cm`],
    [t.profile.fieldAge, t.profile.ageYears(profile.age)],
    [t.profile.fieldDiet, t.diets[profile.dietPreference]],
  ]

  return (
    <Card>
      <CardHeader title={t.profile.settingsTitle} subtitle={t.profile.settingsSubtitle} icon="Settings" />
      <CardBody className="space-y-4 pt-3">
        {isDemo && (
          <Badge tone="crimson" icon="Sparkles">
            {t.profile.demoBadge}
          </Badge>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink-muted">{t.profile.languageLabel}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {LANGUAGES.map((code) => (
              <OptionCard
                key={code}
                selected={language === code}
                onSelect={() => setLanguage(code)}
                icon="Globe"
                title={LANGUAGE_NAMES[code]}
                description={code === 'pt' ? 'Português de Portugal' : 'English (UK)'}
              />
            ))}
          </div>
          <p className="text-xs text-ink-faint">{t.profile.languageHint}</p>
        </div>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between rounded-lg border border-void-600 bg-void-800/40 px-3 py-2"
            >
              <dt className="text-ink-muted">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {targets && (
          <div className="rounded-xl border border-void-600 bg-void-900/40 p-3.5 text-sm">
            <p className="font-medium text-ink">{t.profile.dailyTargets}</p>
            <p className="mt-1 tabular-nums text-ink-muted">
              {t.profile.targetsSummary(n(targets.calories), targets.proteinG, targets.carbsG, targets.fatG)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button icon="Pencil" onClick={openEdit}>
            {t.profile.editProfile}
          </Button>
          <Button variant="danger" icon="Trash2" onClick={() => setConfirmReset(true)}>
            {t.profile.resetData}
          </Button>
        </div>

        <Disclaimer>{t.disclaimer.settings}</Disclaimer>
      </CardBody>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title={t.profile.editTitle}
        description={t.profile.editDescription}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditing(false)}>{t.common.cancel}</Button>
            <Button variant="primary" icon="Check" onClick={save}>
              {t.common.save}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.profile.nameLabel}>
            {(id) => (
              <TextInput
                id={id}
                value={draft.name}
                maxLength={24}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            )}
          </Field>
          <Field label={t.profile.fieldGoal}>
            {(id) => (
              <Select
                id={id}
                value={draft.goal}
                onChange={(event) => setDraft({ ...draft, goal: event.target.value as Goal })}
              >
                {GOAL_ORDER.map((goal) => (
                  <option key={goal} value={goal}>
                    {t.goals[goal]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t.profile.weightLabel}>
            {(id) => (
              <TextInput
                id={id}
                type="number"
                step="0.1"
                value={draft.weightKg}
                onChange={(event) => setDraft({ ...draft, weightKg: Number(event.target.value) })}
              />
            )}
          </Field>
          <Field label={t.onboarding.heightLabel}>
            {(id) => (
              <TextInput
                id={id}
                type="number"
                value={draft.heightCm}
                onChange={(event) => setDraft({ ...draft, heightCm: Number(event.target.value) })}
              />
            )}
          </Field>
          <Field label={t.profile.fieldAge}>
            {(id) => (
              <TextInput
                id={id}
                type="number"
                value={draft.age}
                onChange={(event) => setDraft({ ...draft, age: Number(event.target.value) })}
              />
            )}
          </Field>
          <Field label={t.profile.daysLabel}>
            {(id) => (
              <Select
                id={id}
                value={draft.daysPerWeek}
                onChange={(event) => setDraft({ ...draft, daysPerWeek: Number(event.target.value) })}
              >
                {[2, 3, 4, 5, 6].map((days) => (
                  <option key={days} value={days}>
                    {t.profile.daysOption(days)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t.profile.fieldDiet}>
            {(id) => (
              <Select
                id={id}
                value={draft.dietPreference}
                onChange={(event) => setDraft({ ...draft, dietPreference: event.target.value as DietPreference })}
              >
                {DIET_ORDER.map((diet) => (
                  <option key={diet} value={diet}>
                    {t.diets[diet]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <div className="mt-4 rounded-xl border border-ember/30 bg-ember/5 p-3.5 text-sm">
          <p className="font-medium text-ink">{t.profile.newTargets}</p>
          <p className="mt-1 tabular-nums text-ink-muted">
            {t.profile.targetsSummary(n(preview.calories), preview.proteinG, preview.carbsG, preview.fatG)}
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmReset}
        title={t.profile.resetTitle}
        message={t.profile.resetMessage}
        confirmLabel={t.profile.resetConfirm}
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetEverything()
          setConfirmReset(false)
          navigate('/inicio', { replace: true })
        }}
      />
    </Card>
  )
}

export function ProfilePage() {
  const { t } = useI18n()
  const profile = useUserStore((state) => state.profile)
  // Toca nas stores para que a página reaja a alterações vindas de outras áreas.
  useNutritionStore((state) => state.entries.length)
  useQuestStore((state) => state.daily.length)

  if (!profile) return null

  return (
    <div className="space-y-5">
      <div className="hidden md:block">
        <h1 className="slash-divider text-3xl font-bold text-ink">{t.profile.title}</h1>
        <p className="mt-3 text-ink-muted">{t.profile.subtitle}</p>
      </div>

      <AvatarCard />

      <div className="grid gap-5 lg:grid-cols-2">
        <AttributesCard />
        <DivisionPanel />
        <StatsCard />
      </div>

      <BodyProgressCard />
      <ProgressCharts />
      <AchievementsGrid />
      <InventoryPanel />
      <ArtworkPanel />
      <VisionSettingsCard />
      <SettingsCard />
    </div>
  )
}
