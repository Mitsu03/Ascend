import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, EmptyState, Tabs } from '@/components/ui/Misc'
import { QuestCard } from '@/features/quests/QuestCard'
import { formatLongDate, startOfWeek, today } from '@/services/dates'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import { useUserStore } from '@/store/userStore'
import type { Quest } from '@/types'

export function QuestsPage() {
  const [tab, setTab] = useState<'diarias' | 'semanais'>('diarias')
  const daily = useQuestStore((state) => state.daily)
  const weekly = useQuestStore((state) => state.weekly)
  const replacementsUsed = useQuestStore((state) => state.replacementsUsed)
  const addProgress = useQuestStore((state) => state.setProgress)
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
    addProgress(quest.id, quest.progress + amount)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Missões</h1>
          <p className="mt-1 text-ink-muted">
            {tab === 'diarias' ? formatLongDate(today()) : `Semana de ${formatLongDate(startOfWeek(today()))}`}
          </p>
        </div>
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'diarias', label: 'Diárias', icon: 'ListChecks' },
            { value: 'semanais', label: 'Semanais', icon: 'CalendarDays' },
          ]}
        />
      </header>

      <Card>
        <CardHeader
          title={tab === 'diarias' ? 'Missões do dia' : 'Missões da semana'}
          subtitle={`${completedCount} de ${list.length} concluídas`}
          icon="Target"
          action={
            completedCount === list.length && list.length > 0 ? (
              <Badge tone="good" icon="CheckCircle2">
                Tudo concluído
              </Badge>
            ) : undefined
          }
        />
        <CardBody>
          {list.length === 0 ? (
            <EmptyState
              icon="Target"
              title="Sem missões por agora"
              message="As missões são geradas automaticamente ao início de cada dia e de cada semana."
            />
          ) : (
            <ul className="space-y-3">
              {list.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  canReplace={!replacementsUsed.includes(quest.id)}
                  onProgress={(amount) => handleProgress(quest, amount)}
                  onReplace={
                    profile ? () => replaceQuest(quest.id, profile, targets) : undefined
                  }
                />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {special.length > 0 && (
        <Card glow="gold">
          <CardHeader
            title="Desafio especial"
            subtitle="Recompensa cosmética exclusiva"
            icon="Trophy"
            action={<Badge tone="gold" icon="Star">Épico</Badge>}
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
        Falhar uma missão não tem penalização. Podes trocar cada missão uma vez por período se ela não fizer
        sentido para o teu dia.
      </p>
    </div>
  )
}
