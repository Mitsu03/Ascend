import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCosmetic } from '@/data/cosmetics'
import { EXERCISE_BY_ID } from '@/data/exercises'
import { HeroAvatar } from '@/components/HeroAvatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, EmptyState, Stat } from '@/components/ui/Misc'
import { MacroBar, ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { QuestCard } from '@/features/quests/QuestCard'
import { formatNumber } from '@/lib/cn'
import { levelFromXp, titleForLevel } from '@/services/calculations'
import { formatLongDate, greetingForHour, today } from '@/services/dates'
import { STREAK_AT_RISK_MESSAGE, narrativeForDay } from '@/services/narrative'
import { estimateDuration, totalSets } from '@/services/planGenerator'
import { useGameStore } from '@/store/gameStore'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'
import type { Quest } from '@/types'

function StreakCard() {
  const streak = useGameStore((state) => state.streak)
  const bestStreak = useGameStore((state) => state.bestStreak)
  const status = useGameStore((state) => state.streakStatus)
  const recoveryAvailable = useGameStore((state) => state.recoveryAvailable)
  const useRecoveryDay = useGameStore((state) => state.useRecoveryDay)

  return (
    <Card className="flex flex-col justify-between p-5" glow={streak >= 7 ? 'gold' : 'none'}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-muted">Sequência</p>
          <p className="font-display text-4xl font-bold text-warn">
            {streak}
            <span className="ml-1.5 text-base font-medium text-ink-muted">
              {streak === 1 ? 'dia' : 'dias'}
            </span>
          </p>
          <p className="mt-1 text-xs text-ink-faint">Melhor marca: {bestStreak} dias</p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-2xl bg-warn/10 text-warn">
          <Icon name="Flame" size={26} />
        </span>
      </div>

      {status === 'em_risco' && recoveryAvailable && (
        <div className="mt-4 rounded-xl border border-warn/40 bg-warn/5 p-3">
          <p className="text-xs leading-relaxed text-ink-muted">{STREAK_AT_RISK_MESSAGE}</p>
          <Button size="sm" variant="gold" icon="HeartPulse" className="mt-2.5" onClick={useRecoveryDay}>
            Usar Dia de Recuperação
          </Button>
        </div>
      )}
      {status !== 'em_risco' && (
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          {recoveryAvailable
            ? 'Tens um Dia de Recuperação guardado para quando precisares.'
            : 'Dia de Recuperação usado — recuperas outro ao fim de 7 dias de sequência.'}
        </p>
      )}
    </Card>
  )
}

function NextWorkoutCard() {
  const navigate = useNavigate()
  const plan = useWorkoutStore((state) => state.plan)
  const workoutForDate = useWorkoutStore((state) => state.workoutForDate)
  const isCompletedOn = useWorkoutStore((state) => state.isCompletedOn)
  const startSession = useWorkoutStore((state) => state.startSession)

  const workout = workoutForDate(today())
  const done = workout ? isCompletedOn(workout.id, today()) : false

  if (plan.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="Dumbbell"
          title="Ainda não tens plano"
          message="Cria o teu plano semanal para veres aqui o próximo treino."
          action={
            <Button variant="primary" icon="Plus" onClick={() => navigate('/treino')}>
              Ir para Treino
            </Button>
          }
        />
      </Card>
    )
  }

  if (!workout) {
    const nextDay = [...plan].sort((a, b) => a.dayOfWeek - b.dayOfWeek)[0]
    return (
      <Card>
        <CardHeader title="Dia de descanso" subtitle="Sem treino planeado para hoje" icon="Moon" />
        <CardBody className="pt-3">
          <p className="text-sm leading-relaxed text-ink-muted">
            Aproveita para dormir bem e hidratar-te. O próximo treino é <strong className="text-ink">{nextDay.name}</strong>.
          </p>
          <Button className="mt-4" icon="CalendarDays" onClick={() => navigate('/treino')}>
            Ver plano semanal
          </Button>
        </CardBody>
      </Card>
    )
  }

  const exercises = workout.exercises.slice(0, 4)

  return (
    <Card glow={done ? 'none' : 'cyan'}>
      <CardHeader
        title={workout.name}
        subtitle={workout.focus}
        icon="Dumbbell"
        action={done ? <Badge tone="good" icon="CheckCircle2">Concluído</Badge> : undefined}
      />
      <CardBody className="space-y-4 pt-3">
        <div className="flex flex-wrap gap-2">
          <Badge icon="ListChecks">{workout.exercises.length} exercícios</Badge>
          <Badge icon="Timer">≈ {estimateDuration(workout.exercises)} min</Badge>
          <Badge icon="Activity">{totalSets(workout.exercises)} séries</Badge>
        </div>

        <ul className="space-y-1.5 text-sm">
          {exercises.map((item) => (
            <li key={item.exerciseId} className="flex items-center justify-between gap-3">
              <span className="truncate text-ink-muted">{EXERCISE_BY_ID[item.exerciseId]?.name ?? item.exerciseId}</span>
              <span className="shrink-0 tabular-nums text-ink-faint">
                {item.sets} × {item.reps}
              </span>
            </li>
          ))}
          {workout.exercises.length > exercises.length && (
            <li className="text-xs text-ink-faint">+ {workout.exercises.length - exercises.length} exercícios</li>
          )}
        </ul>

        <div className="flex gap-2">
          <Button
            variant={done ? 'secondary' : 'primary'}
            icon="Play"
            fullWidth
            onClick={() => {
              startSession(workout.id)
              navigate('/treino/sessao')
            }}
          >
            {done ? 'Treinar outra vez' : 'Iniciar treino'}
          </Button>
          <Button icon="CalendarDays" onClick={() => navigate('/treino')} aria-label="Ver plano">
            Plano
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

function NutritionCard() {
  const targets = useUserStore((state) => state.targets)
  const entries = useNutritionStore((state) => state.entries)
  const totalsForDate = useNutritionStore((state) => state.totalsForDate)
  const waterForDate = useNutritionStore((state) => state.waterForDate)

  const totals = useMemo(() => totalsForDate(today()), [entries, totalsForDate])
  const water = waterForDate(today())

  if (!targets) return null
  const remaining = Math.max(0, targets.calories - totals.calories)

  return (
    <Card>
      <CardHeader title="Calorias de hoje" subtitle={`${formatNumber(remaining)} kcal restantes`} icon="UtensilsCrossed" />
      <CardBody className="pt-3">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <ProgressRing
            value={totals.calories}
            max={targets.calories}
            size={140}
            tone={totals.calories > targets.calories * 1.05 ? 'warn' : 'cyan'}
            label={`${formatNumber(totals.calories)} de ${formatNumber(targets.calories)} kcal`}
          >
            <span className="font-display text-3xl font-bold tabular-nums text-ink">
              {formatNumber(totals.calories)}
            </span>
            <span className="text-xs text-ink-muted">de {formatNumber(targets.calories)} kcal</span>
          </ProgressRing>

          <div className="w-full flex-1 space-y-3">
            <MacroBar label="Proteína" value={totals.proteinG} target={targets.proteinG} tone="cyan" />
            <MacroBar label="Hidratos" value={totals.carbsG} target={targets.carbsG} tone="violet" />
            <MacroBar label="Gordura" value={totals.fatG} target={targets.fatG} tone="gold" />
            <div className="flex items-center justify-between pt-1 text-xs text-ink-faint">
              <span className="flex items-center gap-1.5">
                <Icon name="Droplets" size={13} />
                Água hoje
              </span>
              <span className="tabular-nums">{(water / 1000).toFixed(2).replace('.', ',')} L</span>
            </div>
          </div>
        </div>
        <Link
          to="/nutricao"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-electric hover:underline"
        >
          Registar refeição
          <Icon name="ArrowRight" size={15} />
        </Link>
      </CardBody>
    </Card>
  )
}

function HeroCard() {
  const profile = useUserStore((state) => state.profile)!
  const xp = useGameStore((state) => state.xp)
  const coins = useGameStore((state) => state.coins)
  const equipped = useGameStore((state) => state.equipped)
  const info = levelFromXp(xp)
  const title = equipped.title ? (getCosmetic(equipped.title)?.value ?? titleForLevel(info.level)) : titleForLevel(info.level)

  return (
    <Card glow="violet" className="overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <HeroAvatar
          size={104}
          variant={profile.avatarVariant}
          hue={profile.avatarHue}
          frameId={equipped.frame}
          auraId={equipped.aura}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-muted">{greetingForHour()},</p>
          <h1 className="truncate font-display text-3xl font-bold text-ink">{profile.name}</h1>
          <p className="mt-0.5 text-sm text-violet-soft">{title}</p>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-ink-muted">Nível {info.level}</span>
              <span className="tabular-nums text-ink-faint">
                {formatNumber(info.currentLevelXp)} / {formatNumber(info.nextLevelXp)} XP
              </span>
            </div>
            <ProgressBar value={info.currentLevelXp} max={info.nextLevelXp} tone="xp" height="lg" showShimmer label="XP" />
          </div>
        </div>

        <div className="flex shrink-0 gap-3 sm:flex-col">
          <Stat label="Moedas" value={formatNumber(coins)} icon="Coins" tone="gold" />
          <Stat label="Nível" value={info.level} icon="TrendingUp" tone="cyan" />
        </div>
      </div>
    </Card>
  )
}

function QuestsCard() {
  const daily = useQuestStore((state) => state.daily)
  const setProgress = useQuestStore((state) => state.setProgress)
  const addWater = useNutritionStore((state) => state.addWater)
  const done = daily.filter((quest) => quest.completed).length

  const handleProgress = (quest: Quest, amount: number) => {
    if (quest.type === 'agua') {
      addWater(amount)
      return
    }
    setProgress(quest.id, quest.progress + amount)
  }

  return (
    <Card>
      <CardHeader
        title="Missões do dia"
        subtitle={`${done} de ${daily.length} concluídas`}
        icon="Target"
        action={
          <Link to="/missoes" className="text-sm font-medium text-cyan-electric hover:underline">
            Ver todas
          </Link>
        }
      />
      <CardBody className="pt-3">
        {daily.length === 0 ? (
          <EmptyState icon="Target" title="Sem missões" message="As missões do dia aparecem aqui todas as manhãs." />
        ) : (
          <ul className="space-y-2.5">
            {daily.map((quest) => (
              <QuestCard key={quest.id} quest={quest} compact onProgress={(amount) => handleProgress(quest, amount)} />
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}

export function DashboardPage() {
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
  const narrative = narrativeForDay({
    name: profile.name,
    streak,
    questsRemaining: daily.filter((quest) => !quest.completed).length,
    workoutDoneToday: workout ? isCompletedOn(workout.id, today()) : false,
    hasWorkoutToday: Boolean(workout),
    caloriesProgress: targets ? totals.calories / targets.calories : 0,
    proteinProgress: targets ? totals.proteinG / targets.proteinG : 0,
    levelUpToday: false,
  })

  return (
    <div className="space-y-5">
      <div className="hidden items-baseline justify-between md:flex">
        <h1 className="text-3xl font-bold text-ink">Base do Herói</h1>
        <p className="text-sm text-ink-muted first-letter:uppercase">{formatLongDate(today())}</p>
      </div>

      <HeroCard />

      <Card className="flex items-start gap-3 border-cyan-electric/25 bg-cyan-electric/5 p-4">
        <span className="mt-0.5 shrink-0 text-cyan-electric">
          <Icon name="Sparkles" size={18} />
        </span>
        <p className="text-balance text-sm leading-relaxed text-ink">{narrative}</p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <NutritionCard />
          <QuestsCard />
        </div>
        <div className="space-y-5 lg:col-span-5">
          <NextWorkoutCard />
          <StreakCard />
        </div>
      </div>
    </div>
  )
}
