import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArtIcon } from '@/components/ArtIcon'
import { DivisionSeal } from '@/components/DivisionSeal'
import { AVATAR_VARIANT_COUNT, HeroAvatar } from '@/components/HeroAvatar'
import { SpiritMotes } from '@/components/art/SpiritArt'
import { useHeroTitle } from '@/components/layout/AppShell'
import { ScreenBackdrop } from '@/components/layout/ScreenBackdrop'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, Disclaimer, Field, OptionCard, Select, Stat, Tabs, TextInput } from '@/components/ui/Misc'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
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
import { DEFAULT_SCRIM, useArtStore } from '@/store/artStore'
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

/**
 * O topo da ficha: o retrato dentro dos dois anéis carmim, a patente, e o
 * reiatsu que falta para a seguinte.
 *
 * O retrato é o `HeroAvatar` que o utilizador configurou — com a máscara, o
 * selo e a aura que tem equipados. O handoff pede expressamente para não
 * mexer na arte deste ecrã, por isso o que muda aqui é só a moldura à volta.
 */
function ShinigamiHeader() {
  const { t, n, loc } = useI18n()
  const profile = useUserStore((state) => state.profile)!
  const xp = useGameStore((state) => state.xp)
  const equipped = useGameStore((state) => state.equipped)
  const info = levelFromXp(xp)
  const title = useHeroTitle(info.level)
  const division = getDivision(profile.divisionId)
  const maskStage = profile.showMask === false ? undefined : maskStageForLevel(info.level)
  const pct = info.nextLevelXp > 0 ? Math.min(100, (info.currentLevelXp / info.nextLevelXp) * 100) : 0

  return (
    <div className="flex flex-col items-center px-5 pt-5 pb-[18px] md:pt-0">
      <div className="relative flex size-28 items-center justify-center">
        {/*
          Os anéis acompanham a forma do retrato. Um `border` não sobrevive ao
          `clip-path` nas diagonais, por isso o de fora é um hexágono pintado
          com 2 px de recorte por dentro — é o filete que fica à vista.
        */}
        <span className="absolute inset-0 hexagon bg-crimson-soft/70" aria-hidden="true">
          <span className="absolute inset-[2px] hexagon bg-void-900" />
        </span>
        <span className="absolute inset-[9px] hexagon bg-crimson-soft/25" aria-hidden="true">
          <span className="absolute inset-px hexagon bg-void-900" />
        </span>
        <span
          className="absolute inset-0 hexagon"
          style={{ background: 'radial-gradient(circle,rgba(239,74,99,.22),transparent 72%)' }}
          aria-hidden="true"
        />
        <HeroAvatar
          size={92}
          variant={profile.avatarVariant}
          hue={profile.avatarHue}
          frameId={equipped.frame}
          auraId={equipped.aura}
          maskStage={maskStage}
          emblemId={profile.avatarEmblem as ArtIconName | undefined}
          divisionId={division.id}
        />
      </div>

      <p className="mt-3.5 font-display text-[34px] leading-none font-bold text-ink [text-shadow:3px_3px_0_rgba(200,16,46,.55)]">
        {profile.name}
      </p>
      <p className="mt-1.5 text-[13px] font-semibold text-ember-soft">
        {t.profile.rankLine(title, String(info.level).padStart(2, '0'))}
      </p>
      <p className="mt-0.5 text-center text-[11.5px] text-ink-muted">
        {loc(division.name)} · {loc(division.motto)}
      </p>

      <div className="mt-3.5 w-full max-w-[250px]">
        <div className="flex justify-between text-[10px] font-semibold tracking-[0.1em] text-ink-muted">
          <span>{t.profile.reiatsuCaption}</span>
          <span className="tabular-nums">
            {n(info.currentLevelXp)} / {n(info.nextLevelXp)}
          </span>
        </div>
        <div
          className="mt-1.5 h-[5px] bg-void-700"
          role="progressbar"
          aria-valuenow={info.currentLevelXp}
          aria-valuemin={0}
          aria-valuemax={info.nextLevelXp}
          aria-label={t.common.levelProgress}
        >
          <div
            className="h-full bg-ember"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/** As quatro artes, em cartões de quatro colunas. */
function CombatArts() {
  const { t } = useI18n()
  const attributes = useGameStore((state) => state.attributes)

  return (
    <section className="px-5 md:px-0">
      <span className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">{t.profile.combatArts}</span>
      <div className="mt-[11px] grid grid-cols-4 gap-2">
        {ATTRIBUTES.map((attribute) => (
          <div
            key={attribute.key}
            className="flex flex-col items-center gap-[7px] chamfer-md border border-void-600 bg-void-800 px-1.5 py-[13px]"
            title={t.attributeHints[attribute.key]}
          >
            <ArtIcon name={attribute.emblem} size={19} className={ATTRIBUTE_COLORS[attribute.tone]} />
            <span className="font-mono text-[23px] leading-none font-bold text-ink">
              {attributes[attribute.key]}
            </span>
            <span className={cn('text-[9.5px] font-semibold', ATTRIBUTE_COLORS[attribute.tone])}>
              {t.attributes[attribute.key]}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Faixa de três números entre dois filetes: dias, treinos e kan. */
function StatsStrip() {
  const { t, n } = useI18n()
  const counters = useGameStore((state) => state.counters)
  const streak = useGameStore((state) => state.streak)
  const coins = useGameStore((state) => state.coins)

  const cells = [
    { caption: t.profile.statDaysCaption, value: n(streak), tone: 'text-warn' },
    { caption: t.profile.statWorkoutsCaption, value: n(counters.workouts), tone: 'text-ink' },
    { caption: t.profile.statKanCaption, value: n(coins), tone: 'text-gold-soft' },
  ]

  return (
    <div className="mx-5 mt-4 flex border-y border-void-700 md:mx-0">
      {cells.map((cell, index) => (
        <div
          key={cell.caption}
          className={cn('flex-1 py-[13px]', index > 0 && 'pl-3.5', index < cells.length - 1 && 'border-r border-void-700')}
        >
          <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-muted">{cell.caption}</p>
          <p className={cn('mt-[3px] font-mono text-2xl leading-none font-bold tabular-nums', cell.tone)}>
            {cell.value}
          </p>
        </div>
      ))}
    </div>
  )
}

function AvatarCard() {
  const { t, loc } = useI18n()
  const profile = useUserStore((state) => state.profile)!
  const setAvatar = useUserStore((state) => state.setAvatar)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const xp = useGameStore((state) => state.xp)
  const equipped = useGameStore((state) => state.equipped)
  const info = levelFromXp(xp)
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

      <CardBody className="relative flex flex-col items-center gap-5">
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
            className="flex chamfer-sm border border-void-600 p-0.5"
            role="group"
            aria-label={t.profile.avatarModeTitle}
          >
            <button
              type="button"
              aria-pressed={!emblemId}
              onClick={() => updateProfile({ avatarEmblem: undefined })}
              className={cn(
                // 26 px de altura no original; 36 no desenho e 44 pt de alvo.
                'tap-target inline-flex min-h-9 items-center chamfer-xs px-3.5 text-xs font-medium transition-colors active:opacity-90',
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
                // 26 px de altura no original; 36 no desenho e 44 pt de alvo.
                'tap-target inline-flex min-h-9 items-center chamfer-xs px-3.5 text-xs font-medium transition-colors active:opacity-90',
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
                  {/*
                    Cinco colunas em vez de seis: com 36 px por célula não havia
                    largura para as separar o suficiente e cada emblema ficava
                    abaixo dos 44 pt. A 44 pt cabem cinco (5×44 + 4×6 = 244 px
                    dentro dos 252 disponíveis) e o alvo é real, não estendido.
                  */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {AVATAR_EMBLEMS.filter((emblem) => emblem.family === family).map((emblem) => (
                      <button
                        key={emblem.id}
                        type="button"
                        title={loc(emblem.name)}
                        aria-label={loc(emblem.name)}
                        aria-pressed={emblemId === emblem.id}
                        onClick={() => updateProfile({ avatarEmblem: emblem.id })}
                        className={cn(
                          'flex size-11 items-center justify-center chamfer-sm border transition-colors active:opacity-90',
                          emblemId === emblem.id
                            ? 'border-ember bg-ember/15 text-ember'
                            : 'border-void-600 text-ink-muted hover:border-void-500 hover:text-ink',
                        )}
                      >
                        <ArtIcon name={emblem.id} size={22} />
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
                      // 32 → 44 pt. Oito variantes em quatro colunas dão
                      // 4×44 + 3×6 = 194 px, dentro da largura do cartão.
                      'size-11 chamfer-sm border text-xs font-semibold transition-colors active:opacity-90',
                      profile.avatarVariant === variant
                        ? 'border-ember bg-ember/15 text-ember'
                        : 'border-void-600 text-ink-muted hover:border-void-500 hover:text-ink',
                    )}
                  >
                    {variant + 1}
                  </button>
                ))}
              </div>
              {/*
                A amostra de cor continua a ter 32 px — é o que o cartão pede —
                mas o botão à volta dela tem 44 pt. Oito cores em quatro
                colunas, duas filas.
              */}
              <div className="grid grid-cols-4 gap-1.5">
                {AVATAR_HUES.map((hue) => (
                  <button
                    key={hue}
                    type="button"
                    aria-label={t.profile.colourAria(hue)}
                    aria-pressed={profile.avatarHue === hue}
                    onClick={() => setAvatar(profile.avatarVariant, hue)}
                    className="flex size-11 items-center justify-center active:opacity-90"
                  >
                    {/*
                      A amostra é hexagonal, como as do Arsenal. O selecionado
                      não pode usar `border`: o recorte come-o nas diagonais.
                      É um hexágono de tinta com a cor recortada 2 px por
                      dentro — o filete fica a toda a volta da forma.
                    */}
                    <span
                      className={cn(
                        'relative size-8 hexagon transition-transform',
                        profile.avatarHue === hue ? 'scale-110 bg-ink' : 'bg-transparent',
                      )}
                    >
                      <span
                        className="absolute inset-[2px] hexagon"
                        style={{ background: `hsl(${hue} 78% 54%)` }}
                      />
                    </span>
                  </button>
                ))}
              </div>

              {/* A máscara só se liga depois de a patente a desbloquear. */}
              {unlockedStage ? (
                // A caixa tinha 14 px. O rótulo inteiro já era tocável; agora a
                // linha tem 44 pt de altura e a caixa 20 px, que é o mínimo
                // para se ver se está ligada.
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-ink-muted">
                  <input
                    type="checkbox"
                    checked={wearsMask}
                    onChange={(event) => updateProfile({ showMask: event.target.checked })}
                    className="size-5 accent-[var(--color-ember)]"
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

        {/*
          A coluna da direita mostrava nome, patente, kan, objetivo e barra de
          reiatsu — exatamente o que o cabeçalho de identidade já mostra no topo
          da ficha, agora que ele ficou fixo por cima dos separadores. Eram
          210 px de repetição em cada abertura do Arsenal. O que sobra aqui é só
          a nota de patente, que não existe em mais lado nenhum.
        */}
        <p className="max-w-prose text-center text-sm text-ink-muted sm:text-left">
          {t.rankNotes[titleKeyForLevel(info.level)]}
        </p>
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
                  'chamfer-md border p-1 transition-colors',
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
                  className="flex items-center justify-between chamfer-sm border border-void-600 bg-void-800/40 px-3 py-2 text-sm"
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

/**
 * `bare` rende só o conteúdo, sem cartão nem cabeçalho — ver a nota igual no
 * `ArtworkPanel`. Este painel abre numa folha a partir das Definições: 1 133 px
 * de formulário que se preenche uma vez e nunca mais não podem ficar a somar-se
 * ao scroll de quem só quer mudar o idioma.
 */
function VisionSettingsCard({ bare = false }: { bare?: boolean }) {
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

  const content = (
    <div className="space-y-4">
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

        <p className="flex items-start gap-2 chamfer-md border border-void-600 bg-void-900/50 p-3 text-xs leading-relaxed text-ink-faint">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          {t.photoLog.barcodeSourceNote}
        </p>
    </div>
  )

  if (bare) return content

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
      <CardBody className="pt-3">{content}</CardBody>
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
              className="flex justify-between chamfer-sm border border-void-600 bg-void-800/40 px-3 py-2"
            >
              <dt className="text-ink-muted">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {targets && (
          <div className="chamfer-md border border-void-600 bg-void-900/40 p-3.5 text-sm">
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

        <div className="mt-4 chamfer-md border border-ember/30 bg-ember/5 p-3.5 text-sm">
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

/*
 * As quatro faces da ficha.
 *
 * Antes eram onze painéis empilhados numa coluna só, todos ao mesmo nível de
 * importância: cerca de 8 500 px, quase onze ecrãs de scroll para chegar às
 * definições. Agrupá-los por intenção — o que progrediu, o que se ganhou, o que
 * se veste, o que se configura — corta o percurso mais longo para pouco mais de
 * dois ecrãs dentro de uma face.
 *
 * Escolheu-se separadores em vez de secções colapsáveis porque as quatro faces
 * são mutuamente exclusivas na intenção (ninguém quer ver o inventário e as
 * definições ao mesmo tempo) e porque colapsar mantinha na mesma onze
 * cabeçalhos a percorrer. E em vez de folhas porque conquistas e inventário são
 * conteúdo para percorrer, não formulários para preencher.
 */
const PROFILE_SECTIONS = ['progresso', 'conquistas', 'arsenal', 'ajustes'] as const
type ProfileSection = (typeof PROFILE_SECTIONS)[number]

const SECTIONS_NAME = 'ficha'

/**
 * Linha de definição que abre uma folha, como nas listas de Ajustes do iOS: o
 * título diz o que é, o valor à direita diz como está, e o galão indica que há
 * mais por trás. Substitui um painel inteiro aberto na página — a definição
 * continua a um toque, mas deixa de ocupar mil pixels de scroll a quem só
 * passa por aqui para mudar o idioma.
 */
function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onClick,
}: {
  icon: string
  title: string
  subtitle: string
  value?: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 chamfer-md border border-void-600 bg-void-800/40 p-3.5 text-left transition-colors hover:border-void-500 active:opacity-90"
    >
      <span className="flex size-9 shrink-0 items-center justify-center chamfer-md bg-void-700 text-ember">
        <Icon name={icon} size={18} />
      </span>
      {/*
        Título e resumo estavam ambos numa linha com `truncate`, dentro de
        147 px: «Reconhecimento por fotografia» perdia 61 px e o resumo, que é
        um parágrafo inteiro, aparecia com 147 dos seus 1 123 px — não dizia
        nada a ninguém. O título passa a quebrar (é o que identifica a linha) e
        o resumo tem duas linhas, com um texto próprio à medida.
      */}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-balance text-ink">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs text-ink-muted">{subtitle}</span>
      </span>
      {value && <span className="shrink-0">{value}</span>}
      <Icon name="ChevronRight" size={16} className="shrink-0 text-ink-faint" />
    </button>
  )
}

/**
 * Painel de uma face, ligado ao separador que o comanda.
 *
 * Vive fora da `ProfilePage` de propósito: declarado lá dentro, seria um tipo
 * de componente novo a cada render e o React desmontava e remontava a face
 * inteira sempre que a página reagisse a uma alteração das stores — levando
 * com ela o rascunho por gravar do peso, do perfil ou da chave de visão.
 */
function SectionPanel({
  value,
  active,
  children,
}: {
  value: ProfileSection
  active: ProfileSection
  children: ReactNode
}) {
  if (value !== active) return null
  return (
    <div
      // Os nomes têm de bater certo com os que o `Tabs` gera a partir de `name`.
      id={`${SECTIONS_NAME}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${SECTIONS_NAME}-tab-${value}`}
      className="space-y-5"
    >
      {children}
    </div>
  )
}

export function ProfilePage() {
  const { t } = useI18n()
  const profile = useUserStore((state) => state.profile)
  const [section, setSection] = useState<ProfileSection>('progresso')
  const [sheet, setSheet] = useState<'arte' | 'visao' | null>(null)
  const identityRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  const [barHeight, setBarHeight] = useState<number>()

  /*
   * O seletor colava com `top: env(safe-area-inset-top)` e ficava presente a
   * 62 pt do topo — media-o no Simulador: `wrapTop=62`, com a faixa 0–62 a
   * mostrar o conteúdo a passar por trás. Ou tapa o topo todo ou não cola.
   *
   * `top: 0` sozinho punha as pastilhas debaixo da Dynamic Island, e pôr-lhe o
   * inset no `padding-top` só quando cola mudava a altura do elemento em fluxo
   * — e o conteúdo abaixo saltava 62 pt no instante da colagem. Por isso, ao
   * colar, a barra passa a `fixed` (fora do fluxo, pode crescer à vontade) e
   * fica no lugar dela um espaçador com a altura natural. Uma sentinela de 1 px
   * logo acima diz quando isso acontece.
   */
  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const wide = window.matchMedia('(min-width: 768px)')
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting && !wide.matches),
      { threshold: 0 },
    )
    observer.observe(node)
    const onWide = () => {
      if (wide.matches) setStuck(false)
    }
    wide.addEventListener('change', onWide)
    return () => {
      observer.disconnect()
      wide.removeEventListener('change', onWide)
    }
  }, [])

  // A altura do espaçador é a da barra em fluxo; com ela fixa, o valor medido
  // já inclui o inset e não serve.
  useEffect(() => {
    const node = tabsRef.current
    if (!node || stuck) return
    const measure = () => setBarHeight(node.offsetHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [stuck])
  const scrim = useArtStore((state) => state.scrim)
  const vision = useSettingsStore((state) => state.vision)
  // Toca nas stores para que a página reaja a alterações vindas de outras áreas.
  useNutritionStore((state) => state.entries.length)
  useQuestStore((state) => state.daily.length)

  /*
   * Trocar de face a meio de uma lista longa deixava o scroll onde estava e a
   * face nova abria a meio — ou já depois do fim, se fosse mais curta. Volta-se
   * ao seletor, e só quando ele já tinha saído do ecrã: mexer no scroll de quem
   * está no topo seria um salto sem motivo.
   *
   * Duas armadilhas, ambas apanhadas a medir no browser:
   *
   * 1. A posição tem de vir do bloco de identidade e não do próprio seletor.
   *    Num elemento `sticky` o Chrome soma o deslocamento ao `offsetTop`, por
   *    isso, com o seletor colado, `offsetTop` dava sempre o valor do scroll
   *    atual e a comparação nunca era verdadeira.
   * 2. O scroll tem de acontecer depois de o painel novo estar no DOM. Feito
   *    dentro do `onClick`, o ancoramento de scroll do Chrome — que compensa
   *    mudanças de altura acima da janela — desfazia-o assim que o React
   *    trocava o conteúdo.
   */
  const pendingScroll = useRef(false)

  const changeSection = (next: ProfileSection) => {
    pendingScroll.current = true
    setSection(next)
  }

  useEffect(() => {
    if (!pendingScroll.current) return
    pendingScroll.current = false
    const identity = identityRef.current
    if (!identity) return
    // O sítio da sentinela: aí a barra fica no cimo da janela sem colar, e o
    // primeiro cartão da face nova aparece logo por baixo dela.
    const target = identity.offsetTop + identity.offsetHeight
    if (window.scrollY <= target) return
    window.scrollTo({
      top: target,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [section])

  if (!profile) return null

  const sectionLabels: Record<ProfileSection, string> = {
    progresso: t.profile.sectionProgress,
    conquistas: t.profile.sectionAchievements,
    arsenal: t.profile.sectionArsenal,
    ajustes: t.profile.sectionSettings,
  }

  return (
    <>
      <ScreenBackdrop screen="ficha" />

      <div className="hidden md:block">
        <h1 className="slash-divider font-display text-3xl font-bold text-ink">{t.profile.title}</h1>
        <p className="mt-3.5 text-sm text-ink-muted">{t.profile.subtitle}</p>
      </div>

      {/*
        Identidade: fica acima dos separadores e é igual em todas as faces, que
        é o que impede o seletor de se ler como uma segunda barra de navegação.
        São 553 px — o seletor ainda entra no primeiro ecrã, sem scroll.
      */}
      <div ref={identityRef} className="pt-[calc(1.25rem+env(safe-area-inset-top))] md:mt-6 md:pt-0">
        <ShinigamiHeader />
        <CombatArts />
        <StatsStrip />
      </div>

      {/* Sentinela: enquanto se vir, a barra ainda não chegou ao topo. */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />

      {/*
        Espaçador com a altura natural da barra: com ela fixa, é isto que evita
        que o conteúdo abaixo suba 71 pt de repente.
      */}
      <div style={stuck && barHeight ? { height: barHeight } : undefined}>
        <div
          ref={tabsRef}
          className={cn(
            'z-30 border-b border-void-700/70 px-5 pt-4 pb-3 backdrop-blur-xl',
            // Ao colar, tapa o ecrã de bordo a bordo desde o pixel 0 e empurra
            // as pastilhas para baixo da Dynamic Island com o inset no padding.
            // O preto opaco só faz falta aí: no meio do ecrã abria uma faixa
            // cega no fundo da aplicação, agora que há uma imagem por trás.
            stuck
              ? 'fixed inset-x-0 top-0 bg-void-900 pt-[calc(0.75rem+env(safe-area-inset-top))]'
              : 'relative',
            'md:relative md:border-0 md:bg-transparent md:px-0 md:pt-4 md:backdrop-blur-none',
          )}
        >
          <Tabs
            fullWidth
            name={SECTIONS_NAME}
            label={t.profile.sectionsAria}
            value={section}
            onChange={changeSection}
            options={PROFILE_SECTIONS.map((value) => ({ value, label: sectionLabels[value] }))}
            className="md:max-w-md"
          />
        </div>
      </div>

      {/*
        Os painéis empilham com `space-y-5` e não com uma grelha: numa grelha
        sem coluna declarada a faixa implícita fica em `auto`, dimensiona-se ao
        conteúdo e não encolhe — os cartões ficavam com 457 px dentro de um ecrã
        de 376 e a página ganhava scroll lateral. Se alguma face voltar a ter
        colunas, tem de trazer `grid-cols-1` explícito (que é `minmax(0, 1fr)`).
      */}
      <div className="px-5 pt-5 md:px-0">
        {/* Progresso: os números que mudam com o treino e a alimentação. */}
        <SectionPanel value="progresso" active={section}>
          <StatsCard />
          <BodyProgressCard />
          <ProgressCharts />
        </SectionPanel>

        {/* Conquistas: a lista inteira, sozinha — era o painel mais alto. */}
        <SectionPanel value="conquistas" active={section}>
          <AchievementsGrid />
        </SectionPanel>

        {/* Arsenal: tudo o que muda o aspeto do Shinigami. */}
        <SectionPanel value="arsenal" active={section}>
          <AvatarCard />
          <InventoryPanel />
        </SectionPanel>

        {/*
          Ajustes, por ordem de frequência: idioma e dados do perfil primeiro,
          divisão a seguir, e no fim a arte e a chave de visão, que se mexem uma
          vez e nunca mais.
        */}
        <SectionPanel value="ajustes" active={section}>
          <SettingsCard />
          <DivisionPanel />
          <div className="space-y-2">
            <SettingRow
              icon="Image"
              title={t.artwork.title}
              subtitle={t.artwork.subtitle}
              value={
                scrim !== DEFAULT_SCRIM ? (
                  <Badge tone="neutral">{Math.round(scrim * 100)}%</Badge>
                ) : undefined
              }
              onClick={() => setSheet('arte')}
            />
            <SettingRow
              icon="Camera"
              title={t.photoLog.visionTitle}
              // O parágrafo inteiro (`visionHint`) fica para a folha, onde há
              // largura para o ler; aqui vai o resumo de uma linha.
              subtitle={t.photoLog.visionRowHint}
              value={
                <Badge
                  tone={visionIsConfigured(vision) ? 'good' : 'neutral'}
                  icon={visionIsConfigured(vision) ? 'CheckCircle2' : 'Circle'}
                >
                  {visionIsConfigured(vision) ? t.photoLog.visionEnabled : t.photoLog.visionDisabled}
                </Badge>
              }
              onClick={() => setSheet('visao')}
            />
          </div>
        </SectionPanel>
      </div>

      {/*
        As duas folhas. Ficam fora dos painéis para o conteúdo não desaparecer
        de baixo delas se a face mudar com a folha aberta.
      */}
      <Modal open={sheet === 'arte'} onClose={() => setSheet(null)} title={t.artwork.title} description={t.artwork.subtitle}>
        <ArtworkPanel bare />
      </Modal>
      <Modal
        open={sheet === 'visao'}
        onClose={() => setSheet(null)}
        title={t.photoLog.visionTitle}
        description={t.photoLog.visionHint}
      >
        <VisionSettingsCard bare />
      </Modal>
    </>
  )
}
