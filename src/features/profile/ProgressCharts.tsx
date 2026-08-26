import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState, Tabs } from '@/components/ui/Misc'
import { useI18n } from '@/i18n'
import { addDays, formatShortDate, lastNDays, startOfWeek, today } from '@/services/dates'
import { useBodyStore } from '@/store/bodyStore'
import { useGameStore } from '@/store/gameStore'
import { sumEntries, useNutritionStore } from '@/store/nutritionStore'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'

const AXIS_STYLE = { fill: 'var(--color-ink-faint)', fontSize: 11 }

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-void-800)',
  border: '1px solid var(--color-void-600)',
  borderRadius: '0.75rem',
  color: 'var(--color-ink)',
  fontSize: '0.8rem',
}

export function WeightChart() {
  const { t } = useI18n()
  const logs = useBodyStore((state) => state.logs)

  const data = useMemo(
    () =>
      [...logs]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((log) => ({ date: formatShortDate(log.date), value: log.weightKg })),
    [logs],
  )

  if (data.length < 2) {
    return (
      <EmptyState
        icon="Scale"
        title={t.profile.fewLogs}
        message={t.profile.fewLogsText}
      />
    )
  }

  const values = data.map((point) => point.value)
  const min = Math.floor(Math.min(...values) - 1)
  const max = Math.ceil(Math.max(...values) + 1)

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-void-700)" vertical={false} />
          <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
          <YAxis
            domain={[min, max]}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => value.toFixed(1)}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} kg`, t.profile.chartWeight]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-ember)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--color-ember)', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function CaloriesChart() {
  const { t } = useI18n()
  const entries = useNutritionStore((state) => state.entries)
  const targets = useUserStore((state) => state.targets)

  const data = useMemo(
    () =>
      lastNDays(7).map((date) => ({
        date: formatShortDate(date),
        value: sumEntries(entries.filter((entry) => entry.date === date)).calories,
      })),
    [entries],
  )

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-void-700)" vertical={false} />
          <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={52} />
          {targets && (
            <ReferenceLine
              y={targets.calories}
              stroke="var(--color-gold)"
              strokeDasharray="4 4"
              label={{ value: t.profile.chartTarget, fill: 'var(--color-gold)', fontSize: 11, position: 'right' }}
            />
          )}
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} kcal`, t.profile.chartCalories]} />
          <Bar dataKey="value" fill="var(--color-crimson-soft)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function WorkoutsChart() {
  const { t } = useI18n()
  const history = useWorkoutStore((state) => state.history)

  const data = useMemo(() => {
    const currentWeek = startOfWeek(today())
    return Array.from({ length: 4 }, (_, index) => {
      const weekStart = addDays(currentWeek, -7 * (3 - index))
      const weekEnd = addDays(weekStart, 6)
      const count = history.filter((log) => log.date >= weekStart && log.date <= weekEnd).length
      return { label: index === 3 ? t.profile.chartThisWeek : formatShortDate(weekStart), value: count }
    })
  }, [history, t])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-void-700)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_STYLE} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            cursor={{ fill: 'var(--color-void-700)', opacity: 0.4 }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [value, t.profile.chartWorkouts]}
          />
          <Bar dataKey="value" fill="var(--color-ember)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function XpChart() {
  const { t } = useI18n()
  const xpByDate = useGameStore((state) => state.xpByDate)

  const data = useMemo(() => {
    let cumulative = 0
    return lastNDays(14).map((date) => {
      cumulative += xpByDate[date] ?? 0
      return { date: formatShortDate(date), value: cumulative }
    })
  }, [xpByDate])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-void-700)" vertical={false} />
          <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval={1} />
          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={52} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} XP`, t.profile.chartCumulative]} />
          <Line type="monotone" dataKey="value" stroke="var(--color-gold)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProgressCharts() {
  const { t } = useI18n()
  const [tab, setTab] = useState<'calorias' | 'treinos' | 'xp'>('calorias')

  return (
    <Card>
      <CardHeader
        title={t.profile.chartsTitle}
        subtitle={t.profile.chartsSubtitle}
        icon="LineChart"
        action={
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: 'calorias', label: t.profile.chartCalories },
              { value: 'treinos', label: t.profile.chartWorkouts },
              { value: 'xp', label: t.profile.chartXp },
            ]}
          />
        }
      />
      <CardBody className="pt-4">
        {tab === 'calorias' && <CaloriesChart />}
        {tab === 'treinos' && <WorkoutsChart />}
        {tab === 'xp' && <XpChart />}
      </CardBody>
    </Card>
  )
}
