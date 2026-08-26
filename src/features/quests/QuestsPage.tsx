import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, EmptyState, Tabs } from '@/components/ui/Misc'
import { QuestCard } from '@/features/quests/QuestCard'
import { useI18n } from '@/i18n'
import { formatLongDate, startOfWeek, today } from '@/services/dates'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import { useUserStore } from '@/store/userStore'
import type { Quest } from '@/types'

export function QuestsPage() {
  const { t } = useI18n()
  const [tab, setTab] = useState<'diarias' | 'semanais'>('diarias')
  const daily = useQuestStore((state) => state.daily)
  const weekly = useQuestStore((state) => state.weekly)
  const replacementsUsed = useQuestStore((state) => state.replacementsUsed)
  const setProgress = useQuestStore((state) => state.setProgress)
  const replaceQuest = useQuestStore((state) => state.replaceQuest)
  const acceptQuest = useQuestStore((state) => state.acceptQuest)
  const addWater = useNutritionStore((state) => state.addWater)
  const profile = useUserStore((state) => state.profile)
  const targets = useUserStore((state) => state.targets)

  const list = tab === 'diarias' ? daily : weekly.filter((quest) => quest.period === 'semanal')
  const special = weekly.filter((quest) => quest.period === 'especial')
  const completedCount = list.filter((quest) => quest.completed).length

  const handleProgress = (quest: Quest, amount: number) => {
    // A hidratação é registada no diário de nutrição, que por sua vez alimenta a missão.
    if (quest.type === 'agua') {
      addWater(amount)
      return
    }
    setProgress(quest.id, quest.progress + amount)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="slash-divider text-3xl font-bold text-ink">{t.quests.title}</h1>
          <p className="mt-3 text-ink-muted first-letter:uppercase">
            {tab === 'diarias' ? formatLongDate(today()) : t.quests.weekOf(formatLongDate(startOfWeek(today())))}
          </p>
        </div>
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'diarias', label: t.quests.daily, icon: 'ListChecks' },
            { value: 'semanais', label: t.quests.weekly, icon: 'CalendarDays' },
          ]}
        />
      </header>

      <Card>
        <CardHeader
          title={tab === 'diarias' ? t.quests.dailyTitle : t.quests.weeklyTitle}
          subtitle={t.common.completedOf(completedCount, list.length)}
          icon="Target"
          action={
            completedCount === list.length && list.length > 0 ? (
              <Badge tone="good" icon="CheckCircle2">
                {t.quests.allDone}
              </Badge>
            ) : undefined
          }
        />
        <CardBody>
          {list.length === 0 ? (
            <EmptyState icon="Target" title={t.quests.empty} message={t.quests.emptyText} />
          ) : (
            <ul className="space-y-3">
              {list.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  canReplace={!replacementsUsed.includes(quest.id)}
                  onProgress={(amount) => handleProgress(quest, amount)}
                  onReplace={profile ? () => replaceQuest(quest.id, profile, targets) : undefined}
                />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {special.length > 0 && (
        <Card glow="gold">
          <CardHeader
            title={t.quests.specialTitle}
            subtitle={t.quests.specialSubtitle}
            icon="Trophy"
            action={
              <Badge tone="gold" icon="Star">
                {t.quests.epic}
              </Badge>
            }
          />
          <CardBody>
            <ul className="space-y-3">
              {special.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onAccept={() => acceptQuest(quest.id)}
                  onProgress={(amount) => handleProgress(quest, amount)}
                />
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        {t.quests.footnote}
      </p>
    </div>
  )
}
