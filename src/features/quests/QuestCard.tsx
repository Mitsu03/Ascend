import { QUEST_TYPE_ICON } from '@/data/quests'
import { getCosmetic } from '@/data/cosmetics'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { ProgressBar } from '@/components/ui/Progress'
import type { Dictionary } from '@/i18n'
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
function isAutomatic(quest: Quest): boolean {
  if (quest.type === 'treino' || quest.type === 'proteina') return true
  return quest.manualStep === undefined
}

function automaticHint(quest: Quest, t: Dictionary): string {
  if (quest.type === 'treino') return t.quests.hintWorkout
  if (quest.type === 'proteina') return t.quests.hintProtein
  if (quest.type === 'habito') return t.quests.hintDiary
  return t.quests.hintAuto
}

export function QuestCard({ quest, compact = false, onProgress, onReplace, onAccept, canReplace }: QuestCardProps) {
  const { t, n, loc } = useI18n()
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
            : 'border-void-600 bg-void-800/50',
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
                : 'bg-void-700 text-ember',
          )}
        >
          <Icon name={quest.completed ? 'CheckCircle2' : QUEST_TYPE_ICON[quest.type]} size={19} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn('font-semibold', quest.completed ? 'text-good' : 'text-ink')}>{loc(quest.title)}</p>
            <Badge tone={quest.period === 'especial' ? 'gold' : 'neutral'}>{t.questTypes[quest.type]}</Badge>
            {quest.period === 'semanal' && <Badge tone="crimson">{t.quests.weeklyBadge}</Badge>}
          </div>

          {!compact && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{loc(quest.description)}</p>}

          <div className="mt-3 space-y-1.5">
            <ProgressBar
              value={quest.progress}
              max={quest.target}
              tone={quest.completed ? 'good' : quest.period === 'especial' ? 'gold' : 'ember'}
              height="sm"
              label={loc(quest.title)}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="tabular-nums text-ink-muted">
                {n(quest.progress)} / {n(quest.target)} {loc(quest.unit)}
              </span>
              <span className="flex items-center gap-2.5 font-semibold">
                <span className="flex items-center gap-1 text-ember">
                  <Icon name="Zap" size={12} />
                  {quest.rewardXp} {t.common.xp}
                </span>
                <span className="flex items-center gap-1 text-gold">
                  <Icon name="Coins" size={12} />
                  {quest.rewardCoins}
                </span>
                {reward && (
                  <span className="flex items-center gap-1 text-crimson-soft" title={loc(reward.name)}>
                    <Icon name="Gift" size={12} />
                    {loc(reward.name)}
                  </span>
                )}
              </span>
            </div>
          </div>

          {!quest.completed && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {pending && onAccept && (
                <Button size="sm" variant="gold" icon="Check" onClick={onAccept}>
                  {t.quests.accept}
                </Button>
              )}
              {!pending && !isAutomatic(quest) && onProgress && quest.manualStep && (
                <>
                  <Button size="sm" icon="Plus" onClick={() => onProgress(quest.manualStep ?? 1)}>
                    {t.quests.addAmount(n(quest.manualStep), loc(quest.unit))}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onProgress(quest.target - quest.progress)}>
                    {t.quests.complete}
                  </Button>
                </>
              )}
              {!pending && isAutomatic(quest) && (
                <span className="text-xs text-ink-faint">{automaticHint(quest, t)}</span>
              )}
              {onReplace && canReplace && quest.period !== 'especial' && (
                <IconButton
                  icon="RefreshCw"
                  label={t.quests.replaceAria}
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
