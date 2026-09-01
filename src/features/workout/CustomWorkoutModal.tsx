import { useMemo, useState } from 'react'
import { normalize } from '@/data/foods'
import { useI18n } from '@/i18n'
import { localized } from '@/i18n/types'
import { availableExercises } from '@/services/planGenerator'
import { Button, IconButton } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { Badge, Field, SearchInput, Select, TextInput } from '@/components/ui/Misc'
import { useUserStore } from '@/store/userStore'
import { useExerciseResolver } from '@/store/exerciseStore'
import { useWorkoutStore } from '@/store/workoutStore'
import type { MuscleGroup, WorkoutDay, WorkoutExercise } from '@/types'

interface CustomWorkoutModalProps {
  open: boolean
  onClose: () => void
}

const GROUPS: (MuscleGroup | 'todos')[] = [
  'todos',
  'peito',
  'costas',
  'pernas',
  'ombros',
  'bracos',
  'core',
  'cardio',
  'corpo_inteiro',
]

export function CustomWorkoutModal({ open, onClose }: CustomWorkoutModalProps) {
  const { t, lang, loc } = useI18n()
  const resolveExercise = useExerciseResolver()
  const profile = useUserStore((state) => state.profile)
  const addCustomWorkout = useWorkoutStore((state) => state.addCustomWorkout)

  const [name, setName] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<MuscleGroup | 'todos'>('todos')
  const [selected, setSelected] = useState<WorkoutExercise[]>([])

  // Mostra todo o catálogo compatível com o equipamento; o filtro de nível não
  // se aplica aqui porque a escolha é explícita do utilizador.
  const catalogue = useMemo(() => {
    if (!profile) return []
    return availableExercises({ equipment: profile.equipment, level: 'avancado' })
  }, [profile])

  const filtered = useMemo(() => {
    const q = normalize(query)
    return catalogue.filter((exercise) => {
      if (group !== 'todos' && exercise.muscleGroup !== group) return false
      if (!q) return true
      return normalize(exercise.name[lang]).includes(q) || normalize(exercise.name.pt).includes(q)
    })
  }, [catalogue, group, query, lang])

  const reset = () => {
    setName('')
    setDayOfWeek(1)
    setQuery('')
    setGroup('todos')
    setSelected([])
  }

  const add = (exerciseId: string) => {
    if (selected.some((item) => item.exerciseId === exerciseId)) return
    setSelected((current) => [...current, { exerciseId, sets: 3, reps: '10-12', restSeconds: 60 }])
  }

  const update = (index: number, patch: Partial<WorkoutExercise>) =>
    setSelected((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const remove = (index: number) => setSelected((current) => current.filter((_, i) => i !== index))

  const save = () => {
    if (!profile || selected.length === 0) return
    const label = name.trim() || t.builder.defaultName
    const workout: WorkoutDay = {
      id: `custom-${Date.now()}`,
      // O texto escrito pelo utilizador é usado tal e qual nas duas línguas.
      name: localized(label, label),
      focus: localized(t.builder.focus, t.builder.focus),
      dayOfWeek,
      exercises: selected,
      isCustom: true,
      difficulty: profile.level,
    }
    addCustomWorkout(workout)
    reset()
    onClose()
  }

  const exerciseName = (id: string) => {
    const exercise = resolveExercise(id)
    return exercise ? loc(exercise.name) : id
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.builder.title}
      description={t.builder.description}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-muted">{t.builder.selectedCount(selected.length)}</span>
          <div className="flex gap-2">
            <Button onClick={onClose}>{t.common.cancel}</Button>
            <Button variant="primary" icon="Check" onClick={save} disabled={selected.length === 0}>
              {t.builder.saveWorkout}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.builder.nameLabel}>
            {(id) => (
              <TextInput
                id={id}
                value={name}
                maxLength={40}
                placeholder={t.builder.namePlaceholder}
                onChange={(event) => setName(event.target.value)}
              />
            )}
          </Field>
          <Field label={t.builder.dayLabel}>
            {(id) => (
              <Select id={id} value={dayOfWeek} onChange={(event) => setDayOfWeek(Number(event.target.value))}>
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <option key={day} value={day}>
                    {t.weekdays.long[day]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        {selected.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink-muted">{t.builder.chosenExercises}</p>
            <ul className="space-y-2">
              {selected.map((item, index) => (
                <li
                  key={item.exerciseId}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-void-600 bg-void-800/60 p-3"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {exerciseName(item.exerciseId)}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                    {t.builder.setsLabel}
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={item.sets}
                      onChange={(event) => update(index, { sets: Math.max(1, Number(event.target.value)) })}
                      className="w-14 rounded-lg border border-void-600 bg-void-900 px-2 py-1 text-center text-ink"
                      aria-label={t.builder.setsAria(exerciseName(item.exerciseId))}
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                    {t.builder.repsLabel}
                    <input
                      type="text"
                      value={item.reps}
                      onChange={(event) => update(index, { reps: event.target.value })}
                      className="w-20 rounded-lg border border-void-600 bg-void-900 px-2 py-1 text-center text-ink"
                      aria-label={t.builder.repsAria(exerciseName(item.exerciseId))}
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                    {t.builder.restLabel}
                    <input
                      type="number"
                      min={0}
                      max={300}
                      step={15}
                      value={item.restSeconds}
                      onChange={(event) => update(index, { restSeconds: Math.max(0, Number(event.target.value)) })}
                      className="w-16 rounded-lg border border-void-600 bg-void-900 px-2 py-1 text-center text-ink"
                      aria-label={t.builder.restAria(exerciseName(item.exerciseId))}
                    />
                    {t.units.seconds}
                  </label>
                  <IconButton icon="Trash2" label={t.builder.removeAria} size="sm" onClick={() => remove(index)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <SearchInput
            value={query}
            placeholder={t.builder.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t.builder.searchAria}
          />
          <div className="flex flex-wrap gap-1.5">
            {GROUPS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGroup(item)}
                aria-pressed={group === item}
                className={
                  group === item
                    ? 'rounded-full border border-ember/60 bg-ember/10 px-3 py-1 text-xs font-medium text-ember'
                    : 'rounded-full border border-void-600 px-3 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink'
                }
              >
                {item === 'todos' ? t.common.all : t.muscles[item]}
              </button>
            ))}
          </div>

          <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {filtered.map((exercise) => {
              const already = selected.some((item) => item.exerciseId === exercise.id)
              return (
                <li key={exercise.id}>
                  <button
                    type="button"
                    onClick={() => add(exercise.id)}
                    disabled={already}
                    className="flex w-full items-center gap-3 rounded-xl border border-void-600 bg-void-800/50 p-3 text-left transition-colors hover:border-void-500 disabled:opacity-45"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{loc(exercise.name)}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink-faint">{loc(exercise.description)}</span>
                    </span>
                    <Badge tone="neutral">{t.muscles[exercise.muscleGroup]}</Badge>
                    <Badge tone="neutral">{t.equipment[exercise.equipment]}</Badge>
                    <Icon name={already ? 'Check' : 'Plus'} size={16} />
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-ink-faint">{t.builder.noResults}</li>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
