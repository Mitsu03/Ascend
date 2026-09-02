import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge, EmptyState, Select } from '@/components/ui/Misc'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { WORKOUT_COLLECTIONS } from '@/data/workoutCollections'
import { useI18n } from '@/i18n'
import { estimateDuration, totalSets } from '@/services/planGenerator'
import { useExerciseResolver } from '@/store/exerciseStore'
import { useWorkoutStore } from '@/store/workoutStore'
import { toast } from '@/store/toastStore'
import type { CollectionDay, WorkoutCollection } from '@/types'

interface CollectionsModalProps {
  open: boolean
  onClose: () => void
}

/** Séries de uma coleção inteira, para o cartão da lista. */
function weeklySets(collection: WorkoutCollection): number {
  return collection.days.reduce((total, day) => total + totalSets(day.exercises), 0)
}

/** Cartão de uma coleção na lista. */
function CollectionCard({
  collection,
  onOpen,
}: {
  collection: WorkoutCollection
  onOpen: () => void
}) {
  const { t, loc } = useI18n()

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full chamfer-md border border-void-600 bg-void-800 p-4 text-left transition-colors hover:border-ember/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight font-bold text-ink">{loc(collection.name)}</p>
          <p className="mt-1 text-[12.5px] font-semibold text-ember-soft">{loc(collection.tagline)}</p>
        </div>
        <Icon name="ChevronRight" size={16} className="mt-1 shrink-0 text-ink-muted" />
      </div>

      <p className="mt-2.5 text-xs leading-[1.6] text-ink-muted">{loc(collection.description)}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="neutral" icon="CalendarDays">
          {t.collections.daysCount(collection.days.length)}
        </Badge>
        <Badge tone="neutral" icon="ListChecks">
          {t.collections.weeklySets(weeklySets(collection))}
        </Badge>
        <Badge tone="crimson">{t.levels[collection.difficulty]}</Badge>
        <Badge tone="neutral" icon="Dumbbell">
          {t.equipment[collection.equipment]}
        </Badge>
      </div>
    </button>
  )
}

/**
 * Um dia da coleção, com o seletor do dia da semana ao lado do botão.
 *
 * O seletor começa no dia sugerido pela coleção, mas quem só quer o dia de
 * pernas ao sábado muda-o aqui — é essa a diferença entre aplicar a coleção
 * inteira e ir buscar um dia só.
 */
function CollectionDayRow({
  collection,
  day,
  onApplied,
}: {
  collection: WorkoutCollection
  day: CollectionDay
  onApplied: () => void
}) {
  const { t, loc } = useI18n()
  const resolveExercise = useExerciseResolver()
  const plan = useWorkoutStore((state) => state.plan)
  const applyCollectionDay = useWorkoutStore((state) => state.applyCollectionDay)
  const [target, setTarget] = useState(day.suggestedDayOfWeek)
  const [expanded, setExpanded] = useState(false)

  const occupied = plan.some((existing) => existing.dayOfWeek === target)
  const weekday = t.weekdays.long[target]

  const apply = () => {
    applyCollectionDay(collection, day, target)
    toast({
      kind: 'sucesso',
      title: t.collections.appliedDay,
      description: t.collections.appliedDayDetail(loc(day.name), weekday),
      icon: 'CalendarCheck',
    })
    onApplied()
  }

  return (
    <li className="overflow-hidden chamfer-md border border-void-600 bg-void-800">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-ink">{loc(day.name)}</span>
          <span className="mt-0.5 block text-[10.5px] text-ink-muted">{loc(day.focus)}</span>
        </span>
        <span className="hidden shrink-0 text-[10.5px] text-ink-faint sm:block">
          {t.workout.sets(totalSets(day.exercises))} · {t.workout.approxMinutes(estimateDuration(day.exercises))}
        </span>
        <Icon name={expanded ? 'ChevronDown' : 'ChevronRight'} size={13} className="shrink-0 text-ink-muted" />
      </button>

      {expanded && (
        <div className="border-t border-void-700 px-3.5 pt-3 pb-3.5">
          <ul className="space-y-1.5">
            {day.exercises.map((item) => {
              const exercise = resolveExercise(item.exerciseId)
              return (
                <li key={item.exerciseId} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-xs text-ink-muted">
                    {exercise ? loc(exercise.name) : item.exerciseId}
                  </span>
                  <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-ember-soft">
                    {item.sets} × {item.reps}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="mt-3.5 flex flex-wrap items-end gap-2">
            <label className="min-w-[9.5rem] flex-1">
              <span className="mb-1.5 block text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">
                {t.collections.dayLabel}
              </span>
              <Select value={target} onChange={(event) => setTarget(Number(event.target.value))}>
                {t.weekdays.long.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </Select>
            </label>
            <Button variant="primary" icon="CalendarCheck" onClick={apply}>
              {t.collections.applyDay}
            </Button>
          </div>

          <p className="mt-2 text-[11px] text-ink-faint">
            {occupied ? t.collections.replacesDay(weekday) : t.collections.freeDay(weekday)}
          </p>
        </div>
      )}
    </li>
  )
}

/** Detalhe de uma coleção: as notas do autor e os dias, um a um. */
function CollectionDetail({
  collection,
  onBack,
  onApplied,
}: {
  collection: WorkoutCollection
  onBack: () => void
  onApplied: () => void
}) {
  const { t, loc } = useI18n()
  const plan = useWorkoutStore((state) => state.plan)
  const applyCollection = useWorkoutStore((state) => state.applyCollection)
  const [confirming, setConfirming] = useState(false)

  const applyWeek = () => {
    applyCollection(collection)
    setConfirming(false)
    toast({
      kind: 'sucesso',
      title: t.collections.appliedWeek,
      description: t.collections.appliedWeekDetail(loc(collection.name), collection.days.length),
      icon: 'CalendarCheck',
    })
    onApplied()
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" icon="ArrowLeft" onClick={onBack}>
        {t.collections.back}
      </Button>

      <div>
        <p className="font-display text-xl leading-tight font-bold text-ink">{loc(collection.name)}</p>
        <p className="mt-1 text-[12.5px] font-semibold text-ember-soft">{loc(collection.tagline)}</p>
        <p className="mt-2.5 text-xs leading-[1.6] text-ink-muted">{loc(collection.description)}</p>
        {collection.source && (
          <p className="mt-2 text-[11px] text-ink-faint">{t.collections.sourceLabel(loc(collection.source))}</p>
        )}
      </div>

      {collection.notes.length > 0 && (
        <div className="chamfer-md border border-void-700 bg-void-825 p-3.5">
          <p className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">
            {t.collections.notesHeading}
          </p>
          <ul className="mt-2 space-y-2">
            {collection.notes.map((note) => (
              <li key={note.en} className="text-xs leading-[1.6] text-ink-muted">
                {loc(note)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/*
        Aplicar a semana apaga o plano que lá está, por isso passa pela caixa de
        confirmação; aplicar um dia só mexe nesse dia e vai direto.
      */}
      <Button variant="primary" icon="CalendarDays" fullWidth onClick={() => setConfirming(true)}>
        {t.collections.applyWeek}
      </Button>

      <div>
        <p className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">
          {t.collections.daysHeading}
        </p>
        <ul className="mt-2.5 flex flex-col gap-[7px]">
          {collection.days.map((day) => (
            <CollectionDayRow key={day.id} collection={collection} day={day} onApplied={onApplied} />
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={confirming}
        title={t.collections.confirmWeekTitle}
        message={t.collections.confirmWeekMessage(loc(collection.name), collection.days.length)}
        confirmLabel={t.collections.confirmWeekConfirm}
        destructive={plan.length > 0}
        onCancel={() => setConfirming(false)}
        onConfirm={applyWeek}
      />
    </div>
  )
}

export function CollectionsModal({ open, onClose }: CollectionsModalProps) {
  const { t } = useI18n()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = useMemo(
    () => WORKOUT_COLLECTIONS.find((collection) => collection.id === selectedId),
    [selectedId],
  )

  const close = () => {
    onClose()
    // A lista só volta ao princípio depois de a folha fechar, para a saída não
    // mostrar o conteúdo a trocar-se por trás da animação.
    window.setTimeout(() => setSelectedId(null), 200)
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={t.collections.title}
      description={selected ? undefined : t.collections.description}
      size="lg"
    >
      {selected ? (
        <CollectionDetail collection={selected} onBack={() => setSelectedId(null)} onApplied={close} />
      ) : WORKOUT_COLLECTIONS.length === 0 ? (
        <EmptyState icon="ListChecks" title={t.collections.title} message={t.collections.empty} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {WORKOUT_COLLECTIONS.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onOpen={() => setSelectedId(collection.id)}
            />
          ))}
        </div>
      )}
    </Modal>
  )
}
