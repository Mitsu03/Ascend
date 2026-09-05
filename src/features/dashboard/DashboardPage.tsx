import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArtIcon } from '@/components/ArtIcon'
import { ScreenBackdrop } from '@/components/layout/ScreenBackdrop'
import { OrderRow } from '@/features/quests/OrderRow'
import { HeaderIdentity, HeaderTally, ScreenHeader } from '@/components/layout/ScreenHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { WATER_GOAL_ML, levelFromXp, workoutRewards } from '@/services/calculations'
import { formatLongDate, today } from '@/services/dates'
import { narrativeForDay } from '@/services/narrative'
import { estimateDuration, totalSets } from '@/services/planGenerator'
import { useGameStore } from '@/store/gameStore'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'
import type { Dictionary } from '@/i18n'
import type { Quest, WorkoutDay } from '@/types'

/** Rótulo de secção: maiúsculas pequenas, muito espaçadas, cor apagada. */
function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted', className)}>{children}</span>
  )
}

/** Barra fina de progresso, no gradiente carmim→brasa do tema. */
function ThinBar({
  value,
  max,
  height,
  color,
  sweep = false,
  label,
}: {
  value: number
  max: number
  height: number
  color: string
  sweep?: boolean
  label: string
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className="relative overflow-hidden bg-void-700"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-label={label}
    >
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pct}%`, background: color, boxShadow: sweep ? '0 0 14px rgba(255,138,20,.9)' : undefined }}
      >
        {/* Brilho a atravessar: só na barra de patente, que é a que se olha. */}
        {sweep && (
          <span className="absolute inset-y-0 w-[34%] animate-sweep bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        )}
      </div>
    </div>
  )
}

const BAR_EMBER = '#ff8a14'

/**
 * O cartão herói do Quartel: a ordem do dia. É o único elemento do ecrã com
 * moldura acesa e sombra projetada, porque é o único que se espera que seja
 * tocado — tudo o resto abaixo é leitura.
 */
function OrderOfTheDayCard() {
  const navigate = useNavigate()
  const { t, n, loc } = useI18n()
  const plan = useWorkoutStore((state) => state.plan)
  const workoutForDate = useWorkoutStore((state) => state.workoutForDate)
  const isCompletedOn = useWorkoutStore((state) => state.isCompletedOn)
  const startSession = useWorkoutStore((state) => state.startSession)
  const activeSession = useWorkoutStore((state) => state.activeSession)
  const xp = useGameStore((state) => state.xp)

  const info = levelFromXp(xp)
  const workout = workoutForDate(today())
  const done = workout ? isCompletedOn(workout.id, today()) : false
  const resuming = Boolean(activeSession && workout && activeSession.workoutDayId === workout.id)

  const sets = workout ? totalSets(workout.exercises) : 0
  const minutes = workout ? estimateDuration(workout.exercises) : 0
  // A promessa do cartão é a recompensa de uma sessão perfeita — é isso que
  // faz sentido anunciar antes de começar.
  const reward = workoutRewards(sets, sets, minutes * 60)

  const ctaLabel = resuming ? t.dashboard.ctaResume : done ? t.dashboard.ctaTrainAgain : t.dashboard.ctaStart

  const openSession = () => {
    if (!workout) {
      navigate('/treino')
      return
    }
    if (!resuming) startSession(workout.id)
    navigate('/treino/sessao')
  }

  return (
    <section
      className="relative overflow-hidden chamfer-lg border border-ember/40 px-[22px] pt-[22px]"
      style={{ background: 'linear-gradient(165deg,#1a1d25,#0c0e13)' }}
    >
      {/* Arte do cartão: a lâmina em diagonal, o kanji da divisão a sair pelo
          fundo e uma borboleta do inferno pousada no canto. */}
      <ArtIcon
        name="katana"
        size={190}
        className="pointer-events-none absolute -top-[30px] -right-10 rotate-[14deg] text-ember opacity-5"
      />
      <span
        className="pointer-events-none absolute -bottom-[26px] -left-2 font-kanji text-[150px] leading-[0.78] text-ink/[0.045]"
        aria-hidden="true"
      >
        隊
      </span>
      <ArtIcon
        name="hell-butterfly"
        size={20}
        className="pointer-events-none absolute top-5 right-5 -rotate-[16deg] text-crimson-soft opacity-55"
      />
      <span className="pointer-events-none absolute bottom-[70px] left-10 size-[3px] animate-mote rounded-full bg-ember-soft" />
      <span className="pointer-events-none absolute bottom-[60px] left-[120px] size-[2px] animate-mote rounded-full bg-spirit [animation-delay:2.5s]" />

      <div className="relative">
        <p className="text-[10.5px] font-bold tracking-[0.24em] text-ember-soft">{t.dashboard.orderOfTheDay}</p>
        <h1 className="mt-[9px] font-display text-[44px] leading-[1.02] font-bold text-ink [text-shadow:4px_4px_0_rgba(200,16,46,.55)]">
          {workout ? loc(workout.name) : t.dashboard.restDay}
        </h1>
        <p className="mt-[7px] text-[13px] font-semibold text-ember-soft">
          {workout ? loc(workout.focus) : t.dashboard.noWorkoutToday}
        </p>
        <p className="mt-[9px] text-[12.5px] leading-[1.5] text-ink-muted">
          {workout
            ? t.dashboard.workoutMeta(workout.exercises.length, sets, minutes)
            : plan.length === 0
              ? t.dashboard.noPlanText
              : t.dashboard.restDayText}
        </p>

        {workout && (
          <div className="mt-3.5 flex gap-[7px]">
            <span className="chamfer-xs bg-ember/[0.13] px-[11px] py-1.5 text-[11.5px] font-bold text-ember-soft">
              {t.dashboard.rewardXp(n(reward.xp))}
            </span>
            <span className="chamfer-xs bg-gold/[0.13] px-[11px] py-1.5 text-[11.5px] font-bold text-gold-soft">
              {t.dashboard.rewardCoins(n(reward.coins))}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={openSession}
          // O texto era `void-950` para cruzar os 3:1 sobre o extremo carmim do
          // gradiente. Sem gradiente, o fundo é o laranja chapado e o desenho
          // põe-lhe o Vazio por cima — 8,2:1, com folga em qualquer dos dois.
          className="mt-[18px] h-14 w-full chamfer-lg bg-ember font-display text-[19px] font-bold tracking-[0.06em] text-void-950 transition-opacity active:opacity-90"
        >
          {workout ? ctaLabel : t.dashboard.seeWeeklyPlan}
        </button>
      </div>

      {/* Rodapé sangrado: a patente e o reiatsu que falta para a seguinte. */}
      <div className="relative mt-[22px] -mx-[22px]">
        <div className="flex items-baseline justify-between px-[22px] pb-[7px]">
          <span className="text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap text-ink-muted">
            {t.dashboard.rankLabel(String(info.level).padStart(2, '0'))}
          </span>
          <span className="font-mono text-[13px] font-semibold tabular-nums text-ember-soft">
            {n(info.currentLevelXp)} / {n(info.nextLevelXp)}
          </span>
        </div>
        <ThinBar
          value={info.currentLevelXp}
          max={info.nextLevelXp}
          height={3}
          color={BAR_EMBER}
          sweep
          label={t.common.levelProgress}
        />
      </div>
    </section>
  )
}

/** Linha de macro do cartão de rações: rótulo, valor e a sua própria barra. */
function MacroLine({ label, text, value, max, color }: {
  label: string
  text: string
  value: number
  max: number
  color: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11.5px] text-ink-soft">{label}</span>
        <span className="text-[11.5px] font-semibold tabular-nums text-ink">{text}</span>
      </div>
      <div className="mt-1.5">
        <ThinBar value={value} max={max} height={5} color={color} label={label} />
      </div>
    </div>
  )
}

/** Resumo do dia em comida e água, com atalho para o registo. */
function RationsCard() {
  const { t, n, d } = useI18n()
  const targets = useUserStore((state) => state.targets)
  const entries = useNutritionStore((state) => state.entries)
  const totalsForDate = useNutritionStore((state) => state.totalsForDate)
  const waterForDate = useNutritionStore((state) => state.waterForDate)

  const totals = useMemo(() => totalsForDate(today()), [entries, totalsForDate])
  const water = waterForDate(today())
  if (!targets) return null

  const diff = targets.calories - totals.calories

  return (
    <section className="mt-[18px] chamfer-lg border border-void-700/90 bg-void-825 px-[18px] py-4">
      <div className="flex items-baseline justify-between">
        <Eyebrow>{t.dashboard.rationsToday}</Eyebrow>
        {/*
          Os atalhos destes cabeçalhos eram texto de 11,5 px sem qualquer
          padding — cerca de 15 px de altura tocável. O `-my-2 -mr-2` põe a
          área de toque nos 44 pt sem deslocar o texto do alinhamento.
        */}
        <Link
          to="/nutricao"
          className="tap-target -mr-2 -my-2 shrink-0 px-2 py-2 text-[11.5px] font-semibold text-ember active:opacity-90"
        >
          {t.dashboard.register}
        </Link>
      </div>

      <div className="mt-2 flex items-end gap-[9px]">
        <span className="font-mono text-[34px] leading-[0.9] font-bold tabular-nums text-ink">
          {n(totals.calories)}
        </span>
        <span className="pb-[3px] text-xs text-ink-muted">{t.dashboard.ofKcal(n(targets.calories))}</span>
        <span className="ml-auto pb-[3px] text-[11.5px] font-bold text-ember-soft">
          {diff >= 0 ? t.dashboard.missingKcal(n(diff)) : t.dashboard.overKcal(n(-diff))}
        </span>
      </div>

      <div className="mt-[11px]">
        <ThinBar value={totals.calories} max={targets.calories} height={4} color={BAR_EMBER} label={t.units.kcal} />
      </div>

      <div className="mt-[15px] flex flex-col gap-[11px]">
        <MacroLine
          label={t.macros.protein}
          text={t.dashboard.amountOf(n(totals.proteinG), n(targets.proteinG), t.units.grams)}
          value={totals.proteinG}
          max={targets.proteinG}
          color="#ff8a14"
        />
        <MacroLine
          label={t.dashboard.water}
          text={t.dashboard.amountOf(d(water / 1000, 1), d(WATER_GOAL_ML / 1000, 1), 'L')}
          value={water}
          max={WATER_GOAL_ML}
          color="#5cc8ff"
        />
      </div>
    </section>
  )
}

function DailyOrders() {
  const { t } = useI18n()
  const daily = useQuestStore((state) => state.daily)
  const done = daily.filter((quest) => quest.completed).length

  if (daily.length === 0) return null

  return (
    // Em desktop esta é a primeira peça da coluna direita e alinha com o topo
    // do cartão herói; em mobile vem a seguir às rações e precisa do respiro.
    <section className="mt-[18px] md:mt-0">
      <div className="flex items-baseline justify-between">
        <Eyebrow>{t.dashboard.ordersHeading(done, daily.length)}</Eyebrow>
        <Link
          to="/missoes"
          className="tap-target -mr-2 -my-2 shrink-0 px-2 py-2 text-[11.5px] font-semibold text-ember active:opacity-90"
        >
          {t.dashboard.seeAll}
        </Link>
      </div>
      <div className="mt-2.5 flex flex-col gap-[7px]">
        {daily.map((quest) => (
          <OrderRow key={quest.id} quest={quest} />
        ))}
      </div>
    </section>
  )
}

/** Dias de serviço seguidos e a licença de recuperação. */
function StreakCard() {
  const { t } = useI18n()
  const streak = useGameStore((state) => state.streak)
  const bestStreak = useGameStore((state) => state.bestStreak)
  const status = useGameStore((state) => state.streakStatus)
  const recoveryAvailable = useGameStore((state) => state.recoveryAvailable)
  const useRecoveryDay = useGameStore((state) => state.useRecoveryDay)

  return (
    <Card className="mt-[18px] flex flex-col justify-between chamfer-lg border-void-700/90 bg-void-825 p-[18px]">
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>{t.dashboard.streak}</Eyebrow>
          <p className="mt-1.5 font-mono text-[34px] leading-[0.9] font-bold text-warn">
            {streak}
            <span className="ml-1.5 text-xs font-medium text-ink-muted">
              {streak === 1 ? t.common.day : t.common.days}
            </span>
          </p>
          <p className="mt-2 text-[11.5px] text-ink-faint">{t.dashboard.bestStreak(bestStreak)}</p>
        </div>
        <ArtIcon name="fire-ray" size={30} className="text-warn opacity-40" />
      </div>

      {status === 'em_risco' && recoveryAvailable ? (
        <div className="mt-4 chamfer-md border border-warn/40 bg-warn/5 p-3">
          <p className="text-[11.5px] leading-relaxed text-ink-muted">{t.narrative.streakAtRisk}</p>
          <Button size="sm" variant="gold" icon="HeartPulse" className="mt-2.5" onClick={useRecoveryDay}>
            {t.dashboard.useRecovery}
          </Button>
        </div>
      ) : (
        <p className="mt-3.5 text-[11.5px] leading-relaxed text-ink-faint">
          {recoveryAvailable ? t.dashboard.recoveryAvailable : t.dashboard.recoveryUsed}
        </p>
      )}
    </Card>
  )
}

/** A frase do dia, sobre uma mancha de tinta. */
function NarrativeLine({ text }: { text: string }) {
  return (
    <Card className="mt-[18px] flex items-start gap-3.5 chamfer-lg border-ember/25 bg-ember/5 p-4">
      <span className="mt-0.5 shrink-0 text-ember">
        <Icon name="Sparkles" size={16} />
      </span>
      <p className="text-[12.5px] leading-relaxed text-balance text-ink">{text}</p>
    </Card>
  )
}

function buildNarrative(
  t: Dictionary,
  args: {
    streak: number
    daily: Quest[]
    workout: WorkoutDay | undefined
    workoutDone: boolean
    calories: number
    protein: number
    targetCalories: number
    targetProtein: number
  },
): string {
  return narrativeForDay(
    {
      streak: args.streak,
      questsRemaining: args.daily.filter((quest) => !quest.completed).length,
      workoutDoneToday: args.workoutDone,
      hasWorkoutToday: Boolean(args.workout),
      caloriesProgress: args.targetCalories ? args.calories / args.targetCalories : 0,
      proteinProgress: args.targetProtein ? args.protein / args.targetProtein : 0,
      levelUpToday: false,
    },
    t,
  )
}

export function DashboardPage() {
  const { t } = useI18n()
  const profile = useUserStore((state) => state.profile)
  const targets = useUserStore((state) => state.targets)
  const streak = useGameStore((state) => state.streak)
  const daily = useQuestStore((state) => state.daily)
  const entries = useNutritionStore((state) => state.entries)
  const totalsForDate = useNutritionStore((state) => state.totalsForDate)
  const workoutForDate = useWorkoutStore((state) => state.workoutForDate)
  const isCompletedOn = useWorkoutStore((state) => state.isCompletedOn)

  const totals = useMemo(() => totalsForDate(today()), [entries, totalsForDate])
  if (!profile) return null

  const workout = workoutForDate(today())
  const narrative = buildNarrative(t, {
    streak,
    daily,
    workout,
    workoutDone: workout ? isCompletedOn(workout.id, today()) : false,
    calories: totals.calories,
    protein: totals.proteinG,
    targetCalories: targets?.calories ?? 0,
    targetProtein: targets?.proteinG ?? 0,
  })

  return (
    <>
      <ScreenBackdrop screen="quartel" />

      <ScreenHeader>
        <HeaderIdentity />
        <HeaderTally />
      </ScreenHeader>

      {/* Em desktop a barra lateral já diz quem se é; aqui sobra espaço para o
          título da secção e a data por extenso. */}
      <div className="hidden items-end justify-between md:flex">
        <div>
          <h1 className="slash-divider font-display text-3xl font-bold text-ink">{t.dashboard.title}</h1>
          <p className="mt-3.5 text-sm text-ink-muted">{t.dashboard.subtitle}</p>
        </div>
        <p className="text-sm text-ink-muted first-letter:uppercase">{formatLongDate(today())}</p>
      </div>

      <div className="px-5 pt-3.5 md:mt-6 md:grid md:grid-cols-12 md:gap-5 md:px-0 md:pt-0">
        <div className="md:col-span-7">
          <OrderOfTheDayCard />
          <RationsCard />
        </div>
        <div className="md:col-span-5">
          <DailyOrders />
          <NarrativeLine text={narrative} />
          <StreakCard />
        </div>
      </div>
    </>
  )
}
