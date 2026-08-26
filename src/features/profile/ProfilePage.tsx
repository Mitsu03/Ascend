import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCosmetic } from '@/data/cosmetics'
import { HeroAvatar } from '@/components/HeroAvatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, Disclaimer, Field, Select, Stat, TextInput } from '@/components/ui/Misc'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/Progress'
import { AchievementsGrid } from '@/features/profile/AchievementsGrid'
import { InventoryPanel } from '@/features/profile/InventoryPanel'
import { ProgressCharts, WeightChart } from '@/features/profile/ProgressCharts'
import { cn, formatNumber } from '@/lib/cn'
import { computeTargets, levelFromXp, titleForLevel } from '@/services/calculations'
import { formatShortDate, today } from '@/services/dates'
import { resetEverything } from '@/services/session'
import { useBodyStore } from '@/store/bodyStore'
import { useGameStore } from '@/store/gameStore'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'
import type { AttributeKey, DietPreference, Goal, UserProfile } from '@/types'

const ATTRIBUTES: { key: AttributeKey; label: string; icon: string; description: string; tone: string }[] = [
  { key: 'forca', label: 'Força', icon: 'Dumbbell', description: 'Sobe com treinos de força concluídos.', tone: 'cyan' },
  { key: 'resistencia', label: 'Resistência', icon: 'Activity', description: 'Sobe com cardio e sessões longas.', tone: 'good' },
  { key: 'disciplina', label: 'Disciplina', icon: 'Brain', description: 'Sobe com missões e sequências.', tone: 'violet' },
  { key: 'energia', label: 'Energia', icon: 'Battery', description: 'Sobe com sono, água e recuperação.', tone: 'gold' },
]

const ATTRIBUTE_COLORS: Record<string, string> = {
  cyan: 'text-cyan-electric',
  good: 'text-good',
  violet: 'text-violet-soft',
  gold: 'text-gold',
}

const GOAL_LABELS: Record<Goal, string> = {
  perder_gordura: 'Perder gordura',
  ganhar_massa: 'Ganhar massa',
  manter: 'Manter',
  condicao_fisica: 'Melhorar condição física',
}

const DIET_LABELS: Record<DietPreference, string> = {
  sem_preferencia: 'Sem preferência',
  mediterranica: 'Mediterrânica',
  vegetariano: 'Vegetariana',
  vegan: 'Vegana',
}

function AvatarCard() {
  const profile = useUserStore((state) => state.profile)!
  const setAvatar = useUserStore((state) => state.setAvatar)
  const xp = useGameStore((state) => state.xp)
  const coins = useGameStore((state) => state.coins)
  const equipped = useGameStore((state) => state.equipped)
  const info = levelFromXp(xp)
  const title = equipped.title ? (getCosmetic(equipped.title)?.value ?? titleForLevel(info.level)) : titleForLevel(info.level)

  const hues = [190, 265, 320, 35, 145]

  return (
    <Card glow="violet">
      <CardBody className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-3">
          <HeroAvatar
            size={148}
            variant={profile.avatarVariant}
            hue={profile.avatarHue}
            frameId={equipped.frame}
            auraId={equipped.aura}
          />
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((variant) => (
              <button
                key={variant}
                type="button"
                aria-label={`Penteado ${variant + 1}`}
                aria-pressed={profile.avatarVariant === variant}
                onClick={() => setAvatar(variant, profile.avatarHue)}
                className={cn(
                  'size-8 rounded-lg border text-xs font-semibold transition-colors',
                  profile.avatarVariant === variant
                    ? 'border-cyan-electric bg-cyan-electric/15 text-cyan-electric'
                    : 'border-night-600 text-ink-muted hover:text-ink',
                )}
              >
                {variant + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {hues.map((hue) => (
              <button
                key={hue}
                type="button"
                aria-label={`Cor ${hue}`}
                aria-pressed={profile.avatarHue === hue}
                onClick={() => setAvatar(profile.avatarVariant, hue)}
                className={cn(
                  'size-7 rounded-full border-2 transition-transform',
                  profile.avatarHue === hue ? 'border-ink scale-110' : 'border-transparent',
                )}
                style={{ background: `hsl(${hue} 62% 52%)` }}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="font-display text-3xl font-bold text-ink">{profile.name}</h1>
          <p className="mt-0.5 text-violet-soft">{title}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge tone="cyan" icon="TrendingUp">Nível {info.level}</Badge>
            <Badge tone="gold" icon="Coins">{formatNumber(coins)} moedas</Badge>
            <Badge tone="neutral" icon="Target">{GOAL_LABELS[profile.goal]}</Badge>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Progresso do nível</span>
              <span className="tabular-nums text-ink-faint">
                {formatNumber(info.currentLevelXp)} / {formatNumber(info.nextLevelXp)} XP
              </span>
            </div>
            <ProgressBar value={info.currentLevelXp} max={info.nextLevelXp} tone="xp" height="lg" showShimmer label="XP" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function AttributesCard() {
  const attributes = useGameStore((state) => state.attributes)
  const max = Math.max(10, ...Object.values(attributes))

  return (
    <Card>
      <CardHeader title="Atributos" subtitle="Evoluem com as tuas ações" icon="Shield" />
      <CardBody className="space-y-4 pt-3">
        {ATTRIBUTES.map((attribute) => (
          <div key={attribute.key}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <Icon name={attribute.icon} size={15} className={ATTRIBUTE_COLORS[attribute.tone]} />
                {attribute.label}
              </span>
              <span className={cn('font-display text-lg font-bold tabular-nums', ATTRIBUTE_COLORS[attribute.tone])}>
                {attributes[attribute.key]}
              </span>
            </div>
            <ProgressBar
              value={attributes[attribute.key]}
              max={max}
              tone={attribute.tone === 'good' ? 'good' : attribute.tone === 'violet' ? 'violet' : attribute.tone === 'gold' ? 'gold' : 'cyan'}
              height="sm"
              className="mt-1.5"
              label={attribute.label}
            />
            <p className="mt-1 text-[11px] text-ink-faint">{attribute.description}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}

function StatsCard() {
  const counters = useGameStore((state) => state.counters)
  const bestStreak = useGameStore((state) => state.bestStreak)
  const streak = useGameStore((state) => state.streak)
  const history = useWorkoutStore((state) => state.history)

  const totalMinutes = Math.round(history.reduce((sum, log) => sum + log.durationSeconds, 0) / 60)

  return (
    <Card>
      <CardHeader title="Estatísticas" subtitle="O teu percurso até aqui" icon="Award" />
      <CardBody className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
        <Stat label="Treinos" value={counters.workouts} icon="Dumbbell" tone="cyan" />
        <Stat label="Missões" value={counters.quests} icon="Target" tone="violet" />
        <Stat label="Refeições" value={counters.meals} icon="UtensilsCrossed" />
        <Stat label="Sequência atual" value={`${streak} d`} icon="Flame" tone="gold" />
        <Stat label="Melhor sequência" value={`${bestStreak} d`} icon="Trophy" tone="gold" />
        <Stat label="Tempo total" value={`${totalMinutes} min`} icon="Clock" tone="cyan" />
      </CardBody>
    </Card>
  )
}

function BodyProgressCard() {
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
        title="Progresso corporal"
        subtitle={latest ? `Última pesagem: ${formatShortDate(latest.date)}` : 'Sem registos'}
        icon="Scale"
        action={
          logs.length > 1 ? (
            <Badge tone={delta <= 0 ? 'good' : 'warn'} icon="TrendingUp">
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1).replace('.', ',')} kg
            </Badge>
          ) : undefined
        }
      />
      <CardBody className="space-y-4 pt-3">
        <WeightChart />

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Peso (kg)">
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
          <Field label="Cintura (cm, opcional)">
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
            Registar
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
                  className="flex items-center justify-between rounded-lg border border-night-600 bg-night-800/40 px-3 py-2 text-sm"
                >
                  <span className="text-ink-muted">{formatShortDate(log.date)}</span>
                  <span className="tabular-nums text-ink">
                    {log.weightKg.toFixed(1).replace('.', ',')} kg
                    {log.waistCm ? ` · ${log.waistCm} cm` : ''}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}

function SettingsCard() {
  const navigate = useNavigate()
  const profile = useUserStore((state) => state.profile)!
  const targets = useUserStore((state) => state.targets)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const isDemo = useUserStore((state) => state.isDemo)

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

  return (
    <Card>
      <CardHeader title="Definições" subtitle="Perfil, metas e dados" icon="Settings" />
      <CardBody className="space-y-4 pt-3">
        {isDemo && (
          <Badge tone="violet" icon="Sparkles">
            Estás a explorar o perfil de demonstração
          </Badge>
        )}

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            ['Objetivo', GOAL_LABELS[profile.goal]],
            ['Dias por semana', `${profile.daysPerWeek}`],
            ['Peso', `${profile.weightKg} kg`],
            ['Altura', `${profile.heightCm} cm`],
            ['Idade', `${profile.age} anos`],
            ['Preferência alimentar', DIET_LABELS[profile.dietPreference]],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between rounded-lg border border-night-600 bg-night-800/40 px-3 py-2">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {targets && (
          <div className="rounded-xl border border-night-600 bg-night-900/40 p-3.5 text-sm">
            <p className="font-medium text-ink">Metas diárias estimadas</p>
            <p className="mt-1 tabular-nums text-ink-muted">
              {formatNumber(targets.calories)} kcal · P {targets.proteinG} g · H {targets.carbsG} g · G{' '}
              {targets.fatG} g
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button icon="Pencil" onClick={openEdit}>
            Editar perfil
          </Button>
          <Button variant="danger" icon="Trash2" onClick={() => setConfirmReset(true)}>
            Repor dados
          </Button>
        </div>

        <Disclaimer>
          Os cálculos são estimativas para gestão pessoal e não constituem aconselhamento médico ou
          nutricional. Todos os dados ficam apenas neste dispositivo.
        </Disclaimer>
      </CardBody>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Editar perfil"
        description="Alterar estes valores recalcula as tuas metas."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditing(false)}>Cancelar</Button>
            <Button variant="primary" icon="Check" onClick={save}>
              Guardar
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            {(id) => (
              <TextInput
                id={id}
                value={draft.name}
                maxLength={24}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            )}
          </Field>
          <Field label="Objetivo">
            {(id) => (
              <Select
                id={id}
                value={draft.goal}
                onChange={(event) => setDraft({ ...draft, goal: event.target.value as Goal })}
              >
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Peso (kg)">
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
          <Field label="Altura (cm)">
            {(id) => (
              <TextInput
                id={id}
                type="number"
                value={draft.heightCm}
                onChange={(event) => setDraft({ ...draft, heightCm: Number(event.target.value) })}
              />
            )}
          </Field>
          <Field label="Idade">
            {(id) => (
              <TextInput
                id={id}
                type="number"
                value={draft.age}
                onChange={(event) => setDraft({ ...draft, age: Number(event.target.value) })}
              />
            )}
          </Field>
          <Field label="Dias de treino por semana">
            {(id) => (
              <Select
                id={id}
                value={draft.daysPerWeek}
                onChange={(event) => setDraft({ ...draft, daysPerWeek: Number(event.target.value) })}
              >
                {[2, 3, 4, 5, 6].map((days) => (
                  <option key={days} value={days}>
                    {days} dias
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Preferência alimentar">
            {(id) => (
              <Select
                id={id}
                value={draft.dietPreference}
                onChange={(event) => setDraft({ ...draft, dietPreference: event.target.value as DietPreference })}
              >
                {Object.entries(DIET_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <div className="mt-4 rounded-xl border border-cyan-electric/30 bg-cyan-electric/5 p-3.5 text-sm">
          <p className="font-medium text-ink">Novas metas estimadas</p>
          <p className="mt-1 tabular-nums text-ink-muted">
            {formatNumber(preview.calories)} kcal · P {preview.proteinG} g · H {preview.carbsG} g · G{' '}
            {preview.fatG} g
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmReset}
        title="Repor todos os dados?"
        message="Perfil, plano, histórico, missões e conquistas serão apagados deste dispositivo. Esta ação não pode ser desfeita."
        confirmLabel="Apagar tudo"
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
  const profile = useUserStore((state) => state.profile)
  // Toca nas stores para que a página reaja a alterações vindas de outras áreas.
  useNutritionStore((state) => state.entries.length)
  useQuestStore((state) => state.daily.length)

  if (!profile) return null

  return (
    <div className="space-y-5">
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-ink">Perfil</h1>
        <p className="mt-1 text-ink-muted">O teu progresso, atributos e conquistas</p>
      </div>

      <AvatarCard />

      <div className="grid gap-5 lg:grid-cols-2">
        <AttributesCard />
        <StatsCard />
      </div>

      <BodyProgressCard />
      <ProgressCharts />
      <AchievementsGrid />
      <InventoryPanel />
      <SettingsCard />
    </div>
  )
}
