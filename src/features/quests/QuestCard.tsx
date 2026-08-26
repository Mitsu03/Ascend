import { QUEST_TYPE_ICON, QUEST_TYPE_LABELS } from '@/data/quests'
import { cn, formatNumber } from '@/lib/cn'
import { Button, IconButton } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { ProgressBar } from '@/components/ui/Progress'
import { getCosmetic } from '@/data/cosmetics'
import type { Quest } from '@/types'

interface QuestCardProps {
  quest: Quest
  compact?: boolean
  onProgress?: (amount: number) => void
  onReplace?: () => void
  onAccept?: () => void
  canReplace?: boolean
}

/** Missões cujo progresso vem de outras áreas da app. */
const AUTOMATIC_TYPES = new Set(['treino'])

function isAutomatic(quest: Quest): boolean {
  if (AUTOMATIC_TYPES.has(quest.type)) return true
  if (quest.type === 'proteina') return true
  return quest.manualStep === undefined
}

function automaticHint(quest: Quest): string {
  if (quest.type === 'treino') return 'Progride ao concluir treinos'
  if (quest.type === 'proteina') return 'Progride ao registar refeições'
  if (quest.type === 'habito') return 'Progride ao registar refeições no diário'
  return 'Progresso automático'
}

export function QuestCard({ quest, compact = false, onProgress, onReplace, onAccept, canReplace }: QuestCardProps) {
  const reward = quest.rewardItem ? getCosmetic(quest.rewardItem) : undefined
  const pending = !quest.accepted

  return (
    <li
      className={cn(
        'rounded-xl border p-4 transition-colors',
        quest.completed
          ? 'border-good/40 bg-good/5'
          : quest.period === 'especial'
            ? 'border-gold/45 bg-gold/5'
            : 'border-night-600 bg-night-800/50',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            quest.completed
              ? 'bg-good/15 text-good'
              : quest.period === 'especial'
                ? 'bg-gold/15 text-gold'
                : 'bg-night-700 text-cyan-electric',
          )}
        >
          <Icon name={quest.completed ? 'CheckCircle2' : QUEST_TYPE_ICON[quest.type]} size={19} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn('font-semibold', quest.completed ? 'text-good' : 'text-ink')}>{quest.title}</p>
            <Badge tone={quest.period === 'especial' ? 'gold' : 'neutral'}>{QUEST_TYPE_LABELS[quest.type]}</Badge>
            {quest.period === 'semanal' && <Badge tone="violet">Semanal</Badge>}
          </div>

          {!compact && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{quest.description}</p>}

          <div className="mt-3 space-y-1.5">
            <ProgressBar
              value={quest.progress}
              max={quest.target}
              tone={quest.completed ? 'good' : quest.period === 'especial' ? 'gold' : 'cyan'}
              height="sm"
              label={quest.title}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="tabular-nums text-ink-muted">
                {formatNumber(quest.progress)} / {formatNumber(quest.target)} {quest.unit}
              </span>
              <span className="flex items-center gap-2.5 font-semibold">
                <span className="flex items-center gap-1 text-cyan-electric">
                  <Icon name="Zap" size={12} />
                  {quest.rewardXp} XP
                </span>
                <span className="flex items-center gap-1 text-gold">
                  <Icon name="Coins" size={12} />
                  {quest.rewardCoins}
                </span>
                {reward && (
                  <span className="flex items-center gap-1 text-violet-soft" title={reward.name}>
                    <Icon name="Gift" size={12} />
                    {reward.name}
                  </span>
                )}
              </span>
            </div>
          </div>

          {!quest.completed && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {pending && onAccept && (
                <Button size="sm" variant="gold" icon="Check" onClick={onAccept}>
                  Aceitar desafio
                </Button>
              )}
              {!pending && !isAutomatic(quest) && onProgress && quest.manualStep && (
                <>
                  <Button size="sm" icon="Plus" onClick={() => onProgress(quest.manualStep ?? 1)}>
                    +{formatNumber(quest.manualStep)} {quest.unit}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onProgress(quest.target - quest.progress)}>
                    Concluir
                  </Button>
                </>
              )}
              {!pending && isAutomatic(quest) && (
                <span className="text-xs text-ink-faint">{automaticHint(quest)}</span>
              )}
              {onReplace && canReplace && quest.period !== 'especial' && (
                <IconButton
                  icon="RefreshCw"
                  label="Substituir missão"
                  size="sm"
                  className="ml-auto"
                  onClick={onReplace}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
