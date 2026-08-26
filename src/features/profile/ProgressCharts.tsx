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
import { addDays, formatShortDate, lastNDays, startOfWeek, today } from '@/services/dates'
import { useBodyStore } from '@/store/bodyStore'
import { useGameStore } from '@/store/gameStore'
import { sumEntries, useNutritionStore } from '@/store/nutritionStore'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'

const AXIS_STYLE = { fill: 'var(--color-ink-faint)', fontSize: 11 }

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-night-800)',
  border: '1px solid var(--color-night-600)',
  borderRadius: '0.75rem',
  color: 'var(--color-ink)',
  fontSize: '0.8rem',
}

export function WeightChart() {
  const logs = useBodyStore((state) => state.logs)

  const data = useMemo(
    () =>
      [...logs]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((log) => ({ date: formatShortDate(log.date), peso: log.weightKg })),
    [logs],
  )

  if (data.length < 2) {
    return (
      <EmptyState
        icon="Scale"
        title="Poucos registos"
        message="Regista pelo menos duas pesagens para veres a evolução no gráfico."
      />
    )
  }

  const values = data.map((point) => point.peso)
  const min = Math.floor(Math.min(...values) - 1)
  const max = Math.ceil(Math.max(...values) + 1)

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-night-700)" vertical={false} />
          <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
          <YAxis
            domain={[min, max]}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => value.toFixed(1)}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} kg`, 'Peso']} />
          <Line
            type="monotone"
            dataKey="peso"
            stroke="var(--color-cyan-electric)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--color-cyan-electric)', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function CaloriesChart() {
  const entries = useNutritionStore((state) => state.entries)
  const targets = useUserStore((state) => state.targets)

  const data = useMemo(
    () =>
      lastNDays(7).map((date) => ({
        date: formatShortDate(date),
        kcal: sumEntries(entries.filter((entry) => entry.date === date)).calories,
      })),
    [entries],
  )

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-night-700)" vertical={false} />
          <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={52} />
          <Tooltip cursor={{ fill: 'var(--color-night-700)', opacity: 0.4 }} contentStyle={TOOLTIP_STYLE} />
          {targets && (
            <ReferenceLine
              y={targets.calories}
              stroke="var(--color-gold)"
              strokeDasharray="4 4"
              label={{ value: 'Meta', fill: 'var(--color-gold)', fontSize: 11, position: 'right' }}
            />
          )}
          <Bar dataKey="kcal" fill="var(--color-violet-soft)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function WorkoutsChart() {
  const history = useWorkoutStore((state) => state.history)

  const data = useMemo(() => {
    const currentWeek = startOfWeek(today())
    return Array.from({ length: 4 }, (_, index) => {
      const weekStart = addDays(currentWeek, -7 * (3 - index))
      const weekEnd = addDays(weekStart, 6)
      const count = history.filter((log) => log.date >= weekStart && log.date <= weekEnd).length
      return { semana: index === 3 ? 'Esta semana' : `${formatShortDate(weekStart)}`, treinos: count }
    })
  }, [history])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-night-700)" vertical={false} />
          <XAxis dataKey="semana" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_STYLE} tickLine={false} axisLine={false} width={40} />
          <Tooltip cursor={{ fill: 'var(--color-night-700)', opacity: 0.4 }} contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="treinos" fill="var(--color-cyan-electric)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function XpChart() {
  const xpByDate = useGameStore((state) => state.xpByDate)

  const data = useMemo(() => {
    let cumulative = 0
    return lastNDays(14).map((date) => {
      cumulative += xpByDate[date] ?? 0
      return { date: formatShortDate(date), xp: cumulative }
    })
  }, [xpByDate])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-night-700)" vertical={false} />
          <XAxis dataKey="date" tick={AXIS_STYLE} tickLine={false} axisLine={false} interval={1} />
          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={52} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} XP`, 'Acumulado']} />
          <Line type="monotone" dataKey="xp" stroke="var(--color-gold)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProgressCharts() {
  const [tab, setTab] = useState<'calorias' | 'treinos' | 'xp'>('calorias')

  return (
    <Card>
      <CardHeader
        title="Evolução"
        subtitle="Últimos dias em números"
        icon="LineChart"
        action={
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: 'calorias', label: 'Calorias' },
              { value: 'treinos', label: 'Treinos' },
              { value: 'xp', label: 'XP' },
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
