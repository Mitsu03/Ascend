import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import type { Quest } from '@/types'

/** Missões cujo progresso vem de outras áreas — só se pode ir lá fazer o que falta. */
export function isAutomatic(quest: Quest): boolean {
  if (quest.type === 'treino' || quest.type === 'proteina') return true
  return quest.manualStep === undefined
}

/**
 * Uma ordem em linha única: caixa, título e prémio. O estado cumprido pinta a
 * linha inteira de verde, para se contarem as que faltam sem se ler nada.
 *
 * `detailed` acrescenta a barra de progresso e o prémio em kan — é a forma
 * usada no ecrã das Ordens, onde há espaço; o Quartel usa a forma curta.
 */
export function OrderRow({ quest, detailed = false }: { quest: Quest; detailed?: boolean }) {
  const navigate = useNavigate()
  const { t, loc, n } = useI18n()
  const setProgress = useQuestStore((state) => state.setProgress)
  const addWater = useNutritionStore((state) => state.addWater)
  const done = quest.completed

  const advance = () => {
    if (done) return
    if (isAutomatic(quest)) {
      navigate(quest.type === 'treino' ? '/treino' : '/nutricao')
      return
    }
    if (quest.type === 'agua') {
      addWater(quest.manualStep ?? 250)
      return
    }
    setProgress(quest.id, quest.progress + (quest.manualStep ?? 1))
  }

  const pct = quest.target > 0 ? Math.min(100, (quest.progress / quest.target) * 100) : 0

  return (
    <button
      type="button"
      onClick={advance}
      className={cn(
        'grid items-center gap-[11px] rounded-[13px] border px-[13px] text-left transition-colors',
        detailed ? 'grid-cols-[22px_1fr_auto] py-3' : 'grid-cols-[20px_1fr_auto] py-[11px]',
        done ? 'border-good/40 bg-good/[0.07]' : 'border-void-600 bg-void-800',
      )}
    >
      <span
        className={cn(
          'flex size-5 items-center justify-center rounded-md border-[1.5px] text-xs font-bold',
          done ? 'border-good bg-good text-void-900' : 'border-void-500',
        )}
        aria-hidden="true"
      >
        {done ? '✓' : ''}
      </span>

      <span className="min-w-0">
        <span className={cn('block truncate text-[12.5px]', done ? 'text-good' : 'text-ink')}>{loc(quest.title)}</span>
        {detailed && (
          <span className="mt-1.5 block h-1 rounded-full bg-void-700">
            <span
              className={cn('block h-full rounded-full', done ? 'bg-good' : 'bg-ember')}
              style={{ width: `${pct}%` }}
            />
          </span>
        )}
      </span>

      {detailed ? (
        <span className="flex shrink-0 gap-[5px]">
          <span className="rounded-[5px] bg-ember/[0.14] px-[7px] py-[3px] text-[10.5px] font-bold text-ember-soft">
            +{n(quest.rewardXp)}
          </span>
          <span className="rounded-[5px] bg-gold/[0.14] px-[7px] py-[3px] text-[10.5px] font-bold text-gold-soft">
            +{n(quest.rewardCoins)}
          </span>
        </span>
      ) : (
        <span className={cn('text-[10.5px] font-bold', done ? 'text-good' : 'text-ember-soft')}>
          {done ? t.dashboard.fulfilled : `+${quest.rewardXp}`}
        </span>
      )}
    </button>
  )
}
