import { ArtIcon } from '@/components/ArtIcon'
import { ScreenBackdrop } from '@/components/layout/ScreenBackdrop'
import { ScreenHeader, ScreenTitle } from '@/components/layout/ScreenHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/Misc'
import { OrderRow } from '@/features/quests/OrderRow'
import { QuestCard } from '@/features/quests/QuestCard'
import { useI18n } from '@/i18n'
import { formatLongDate, today } from '@/services/dates'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import { useUserStore } from '@/store/userStore'
import type { Quest } from '@/types'

/**
 * A ordem do capitão: uma por semana, dourada, com o canto superior esquerdo
 * cortado como um documento selado. Os raios cónicos por trás são o mesmo
 * recurso do selo da divisão — é o único cartão da app em ouro, e é assim que
 * se percebe que não é uma ordem qualquer.
 */
function CaptainOrder({ quest }: { quest: Quest }) {
  const { t, loc, n } = useI18n()
  const acceptQuest = useQuestStore((state) => state.acceptQuest)
  const pct = quest.target > 0 ? Math.min(100, (quest.progress / quest.target) * 100) : 0

  return (
    <section
      className="relative overflow-hidden border border-gold/45 p-[22px] shadow-[0_20px_60px_-22px_rgba(255,176,32,.5)] [clip-path:polygon(26px_0,100%_0,100%_100%,0_100%,0_26px)]"
      style={{ background: 'linear-gradient(160deg,#1b1710,#0d0d13)' }}
    >
      <div
        className="pointer-events-none absolute top-[-90px] left-1/2 size-[340px] -ml-[170px] opacity-[0.28]"
        style={{
          background:
            'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,176,32,.5) 0deg 0.6deg, transparent 0.6deg 5deg)',
          maskImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,.9) 24%, transparent 56%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,.9) 24%, transparent 56%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-bold tracking-[0.24em] text-gold-soft">{t.quests.captainOrder}</p>
          <h1 className="mt-2 font-display text-[33px] leading-[1.04] font-bold text-ink [text-shadow:3px_3px_0_rgba(184,18,54,.5)]">
            {loc(quest.title)}
          </h1>
        </div>
        <ArtIcon name="sword-hilt" size={34} className="shrink-0 text-gold-soft" />
      </div>

      <p className="relative mt-3 text-[12.5px] leading-[1.6] text-ink-muted">{t.quests.captainOrderNote}</p>

      <div className="relative mt-[18px] flex items-center justify-between gap-3">
        <span className="font-display text-[15px] font-semibold tabular-nums text-ink">
          {t.quests.ofTarget(n(quest.progress), n(quest.target), loc(quest.unit))}
        </span>
        <span className="flex shrink-0 gap-1.5">
          <span className="rounded-md bg-ember/15 px-[9px] py-1 text-[11px] font-bold text-ember-soft">
            +{n(quest.rewardXp)}
          </span>
          <span className="rounded-md bg-gold/15 px-[9px] py-1 text-[11px] font-bold text-gold-soft">
            +{n(quest.rewardCoins)}
          </span>
        </span>
      </div>

      <div className="relative mt-[9px] h-2 overflow-hidden rounded-full bg-void-700">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-ember" style={{ width: `${pct}%` }} />
      </div>

      {!quest.accepted && (
        <button
          type="button"
          onClick={() => acceptQuest(quest.id)}
          className="relative mt-4 h-11 w-full rounded-xl bg-gradient-to-br from-gold to-ember font-display text-base font-bold tracking-[0.05em] text-void-900 transition-opacity active:opacity-90"
        >
          {t.quests.accept}
        </button>
      )}
    </section>
  )
}

/** Ordem semanal em cartão pequeno, duas por linha. */
function WeeklyOrderCard({ quest }: { quest: Quest }) {
  const { t, loc, n } = useI18n()
  const pct = quest.target > 0 ? Math.min(100, (quest.progress / quest.target) * 100) : 0
  // A cor da barra separa o tipo de esforço: água é espírito, o resto é carmim.
  const bar = quest.completed ? 'bg-good' : quest.type === 'agua' ? 'bg-spirit' : 'bg-crimson-soft'

  return (
    <div className="rounded-[13px] border border-void-600 bg-void-800 p-[13px]">
      <p className="text-[12.5px] font-medium text-ink">{loc(quest.title)}</p>
      <p className="mt-1 text-[10.5px] tabular-nums text-ink-muted">
        {t.quests.ofTarget(n(quest.progress), n(quest.target), loc(quest.unit))}
      </p>
      <div className="mt-2 h-1 rounded-full bg-void-700">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="mt-[9px] inline-block rounded-[5px] bg-ember/[0.14] px-[7px] py-[3px] text-[10.5px] font-bold text-ember-soft">
        +{n(quest.rewardXp)}
      </span>
    </div>
  )
}

export function QuestsPage() {
  const { t } = useI18n()
  const daily = useQuestStore((state) => state.daily)
  const weekly = useQuestStore((state) => state.weekly)
  const replacementsUsed = useQuestStore((state) => state.replacementsUsed)
  const setProgress = useQuestStore((state) => state.setProgress)
  const replaceQuest = useQuestStore((state) => state.replaceQuest)
  const acceptQuest = useQuestStore((state) => state.acceptQuest)
  const addWater = useNutritionStore((state) => state.addWater)
  const profile = useUserStore((state) => state.profile)
  const targets = useUserStore((state) => state.targets)

  const weeklyOrders = weekly.filter((quest) => quest.period === 'semanal')
  const special = weekly.filter((quest) => quest.period === 'especial')
  const dailyDone = daily.filter((quest) => quest.completed).length
  const swapsLeft = daily.filter((quest) => !replacementsUsed.includes(quest.id)).length

  const handleProgress = (quest: Quest, amount: number) => {
    // A hidratação é registada no diário de nutrição, que alimenta a missão.
    if (quest.type === 'agua') {
      addWater(amount)
      return
    }
    setProgress(quest.id, quest.progress + amount)
  }

  return (
    <>
      <ScreenBackdrop screen="ordens" />

      <ScreenHeader>
        <ScreenTitle>{t.quests.title}</ScreenTitle>
        <span className="shrink-0 text-[11.5px] font-semibold text-ink-muted">
          {t.quests.replacementsLeft(swapsLeft)}
        </span>
      </ScreenHeader>

      <div className="hidden flex-wrap items-end justify-between gap-4 md:flex">
        <div>
          <h1 className="slash-divider font-display text-3xl font-bold text-ink">{t.quests.title}</h1>
          <p className="mt-3.5 text-sm text-ink-muted first-letter:uppercase">{formatLongDate(today())}</p>
        </div>
      </div>

      <div className="px-5 pt-4 md:mt-6 md:px-0 md:pt-0">
        {special.length > 0 && <CaptainOrder quest={special[0]} />}

        <section className={special.length > 0 ? 'mt-5' : ''}>
          <span className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">
            {t.dashboard.ordersHeading(dailyDone, daily.length)}
          </span>
          {daily.length === 0 ? (
            <Card className="mt-2.5 rounded-[18px] border-void-700/90 bg-void-825">
              <EmptyState icon="Target" title={t.quests.empty} message={t.quests.emptyText} />
            </Card>
          ) : (
            <div className="mt-2.5 flex flex-col gap-[7px]">
              {daily.map((quest) => (
                <OrderRow key={quest.id} quest={quest} detailed />
              ))}
            </div>
          )}
        </section>

        {weeklyOrders.length > 0 && (
          <section className="mt-[18px]">
            <span className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">{t.quests.weeklyOrders}</span>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {weeklyOrders.map((quest) => (
                <WeeklyOrderCard key={quest.id} quest={quest} />
              ))}
            </div>
          </section>
        )}

        {/* Trocar uma ordem e ver o detalhe completo não cabem na linha
            compacta do protótipo, mas continuam a ser precisos. */}
        <Card className="mt-5 rounded-[18px] border-void-700/90 bg-void-825">
          <CardHeader title={t.quests.dailyTitle} subtitle={t.common.completedOf(dailyDone, daily.length)} icon="Target" />
          <CardBody className="pt-3">
            <ul className="space-y-3">
              {daily.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  canReplace={!replacementsUsed.includes(quest.id)}
                  onProgress={(amount) => handleProgress(quest, amount)}
                  onReplace={profile ? () => replaceQuest(quest.id, profile, targets) : undefined}
                />
              ))}
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

        <p className="mt-4 flex items-start gap-2 text-[10px] leading-[1.55] text-ink-muted">
          <Icon name="Info" size={13} className="mt-0.5 shrink-0" />
          {t.quests.footnote}
        </p>
      </div>
    </>
  )
}
