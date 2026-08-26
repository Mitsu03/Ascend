import { useMemo, useState } from 'react'
import { EQUIPMENT_LABELS, EXERCISE_BY_ID, MUSCLE_LABELS } from '@/data/exercises'
import { availableExercises } from '@/services/planGenerator'
import { normalize } from '@/data/foods'
import { WEEKDAY_LONG } from '@/services/dates'
import { Button, IconButton } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { Badge, Field, SearchInput, Select, TextInput } from '@/components/ui/Misc'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'
import type { MuscleGroup, WorkoutDay, WorkoutExercise } from '@/types'

interface CustomWorkoutModalProps {
  open: boolean
  onClose: () => void
}

export function CustomWorkoutModal({ open, onClose }: CustomWorkoutModalProps) {
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
      return normalize(exercise.name).includes(q)
    })
  }, [catalogue, group, query])

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
    const workout: WorkoutDay = {
      id: `custom-${Date.now()}`,
      name: name.trim() || 'Treino personalizado',
      focus: 'Criado por ti',
      dayOfWeek,
      exercises: selected,
      isCustom: true,
      difficulty: profile.level,
    }
    addCustomWorkout(workout)
    reset()
    onClose()
  }

  const groups: (MuscleGroup | 'todos')[] = [
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Criar treino personalizado"
      description="Escolhe os exercícios, define séries e repetições e adiciona ao teu plano."
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-muted">
            {selected.length} {selected.length === 1 ? 'exercício' : 'exercícios'} selecionados
          </span>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" icon="Check" onClick={save} disabled={selected.length === 0}>
              Guardar treino
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do treino">
            {(id) => (
              <TextInput
                id={id}
                value={name}
                maxLength={40}
                placeholder="Ex.: Superior explosivo"
                onChange={(event) => setName(event.target.value)}
              />
            )}
          </Field>
          <Field label="Dia da semana">
            {(id) => (
              <Select id={id} value={dayOfWeek} onChange={(event) => setDayOfWeek(Number(event.target.value))}>
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <option key={day} value={day}>
                    {WEEKDAY_LONG[day]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        {selected.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink-muted">Exercícios do treino</p>
            <ul className="space-y-2">
              {selected.map((item, index) => (
                <li
                  key={item.exerciseId}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-night-600 bg-night-800/60 p-3"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {EXERCISE_BY_ID[item.exerciseId]?.name}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                    Séries
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={item.sets}
                      onChange={(event) => update(index, { sets: Math.max(1, Number(event.target.value)) })}
                      className="w-14 rounded-lg border border-night-600 bg-night-900 px-2 py-1 text-center text-ink"
                      aria-label={`Séries de ${EXERCISE_BY_ID[item.exerciseId]?.name}`}
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                    Reps
                    <input
                      type="text"
                      value={item.reps}
                      onChange={(event) => update(index, { reps: event.target.value })}
                      className="w-20 rounded-lg border border-night-600 bg-night-900 px-2 py-1 text-center text-ink"
                      aria-label={`Repetições de ${EXERCISE_BY_ID[item.exerciseId]?.name}`}
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                    Descanso
                    <input
                      type="number"
                      min={0}
                      max={300}
                      step={15}
                      value={item.restSeconds}
                      onChange={(event) => update(index, { restSeconds: Math.max(0, Number(event.target.value)) })}
                      className="w-16 rounded-lg border border-night-600 bg-night-900 px-2 py-1 text-center text-ink"
                      aria-label={`Descanso de ${EXERCISE_BY_ID[item.exerciseId]?.name}`}
                    />
                    s
                  </label>
                  <IconButton icon="Trash2" label="Remover exercício" size="sm" onClick={() => remove(index)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <SearchInput
            value={query}
            placeholder="Pesquisar exercício…"
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Pesquisar exercício"
          />
          <div className="flex flex-wrap gap-1.5">
            {groups.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGroup(item)}
                aria-pressed={group === item}
                className={
                  group === item
                    ? 'rounded-full border border-cyan-electric/60 bg-cyan-electric/10 px-3 py-1 text-xs font-medium text-cyan-electric'
                    : 'rounded-full border border-night-600 px-3 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink'
                }
              >
                {item === 'todos' ? 'Todos' : MUSCLE_LABELS[item]}
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
                    className="flex w-full items-center gap-3 rounded-xl border border-night-600 bg-night-800/50 p-3 text-left transition-colors hover:border-night-500 disabled:opacity-45"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{exercise.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink-faint">{exercise.description}</span>
                    </span>
                    <Badge tone="neutral">{MUSCLE_LABELS[exercise.muscleGroup]}</Badge>
                    <Badge tone="neutral">{EQUIPMENT_LABELS[exercise.equipment]}</Badge>
                    <Icon name={already ? 'Check' : 'Plus'} size={16} />
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-ink-faint">Nenhum exercício encontrado.</li>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
