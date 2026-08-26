import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { startOfWeek, today } from '@/services/dates'
import { generateDailyQuests, generateWeeklyQuests, replacementQuest } from '@/services/questGenerator'
import { createPersistStorage } from '@/services/storage'
import { useGameStore } from '@/store/gameStore'
import { toast } from '@/store/toastStore'
import type { MacroTargets, Quest, QuestType, UserProfile, WorkoutDay } from '@/types'

interface QuestStore {
  daily: Quest[]
  weekly: Quest[]
  /** Substituições já usadas por período, para limitar a 1 por missão */
  replacementsUsed: string[]
  ensureQuests: (profile: UserProfile, targets: MacroTargets | null, plan: WorkoutDay[], date?: string) => void
  addProgress: (type: QuestType, amount: number) => void
  setProgress: (questId: string, value: number) => void
  completeQuest: (questId: string) => void
  replaceQuest: (questId: string, profile: UserProfile, targets: MacroTargets | null) => void
  acceptQuest: (questId: string) => void
  hydrate: (daily: Quest[], weekly: Quest[]) => void
  reset: () => void
}

function awardQuest(quest: Quest): void {
  const game = useGameStore.getState()
  game.addXp(quest.rewardXp)
  game.addCoins(quest.rewardCoins)
  game.bumpAttribute(quest.attribute)
  game.incrementCounter('quests')
  game.registerActivity()
  if (quest.rewardItem) game.unlockCosmetic(quest.rewardItem)
  toast({
    kind: 'sucesso',
    title: `Missão concluída: ${quest.title}`,
    description: `+${quest.rewardXp} XP · +${quest.rewardCoins} moedas`,
    icon: 'Target',
  })
  game.checkAchievements()
}

/** Aplica progresso e devolve a missão atualizada + se acabou de ser concluída. */
function applyProgress(quest: Quest, value: number): { quest: Quest; justCompleted: boolean } {
  if (quest.completed || !quest.accepted) return { quest, justCompleted: false }
  const progress = Math.max(0, Math.min(quest.target, value))
  const completed = progress >= quest.target
  return { quest: { ...quest, progress, completed }, justCompleted: completed }
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      daily: [],
      weekly: [],
      replacementsUsed: [],

      ensureQuests: (profile, targets, plan, date = today()) => {
        const weekStart = startOfWeek(date)
        const state = get()
        const hasDaily = state.daily.length > 0 && state.daily.every((quest) => quest.date === date)
        const hasWeekly = state.weekly.length > 0 && state.weekly.every((quest) => quest.date === weekStart)

        set({
          daily: hasDaily ? state.daily : generateDailyQuests(profile, targets, date, plan),
          weekly: hasWeekly ? state.weekly : generateWeeklyQuests(profile, targets, weekStart),
          replacementsUsed: hasDaily ? state.replacementsUsed : [],
        })
      },

      addProgress: (type, amount) => {
        if (amount === 0) return
        const completedQuests: Quest[] = []
        const bump = (quests: Quest[]) =>
          quests.map((quest) => {
            if (quest.type !== type || quest.completed || !quest.accepted) return quest
            const { quest: next, justCompleted } = applyProgress(quest, quest.progress + amount)
            if (justCompleted) completedQuests.push(next)
            return next
          })

        set((state) => ({ daily: bump(state.daily), weekly: bump(state.weekly) }))
        for (const quest of completedQuests) awardQuest(quest)
      },

      setProgress: (questId, value) => {
        const completedQuests: Quest[] = []
        const update = (quests: Quest[]) =>
          quests.map((quest) => {
            if (quest.id !== questId) return quest
            const { quest: next, justCompleted } = applyProgress(quest, value)
            if (justCompleted) completedQuests.push(next)
            return next
          })

        set((state) => ({ daily: update(state.daily), weekly: update(state.weekly) }))
        for (const quest of completedQuests) awardQuest(quest)
      },

      completeQuest: (questId) => {
        const quest = [...get().daily, ...get().weekly].find((item) => item.id === questId)
        if (!quest || quest.completed) return
        get().setProgress(questId, quest.target)
      },

      replaceQuest: (questId, profile, targets) => {
        const state = get()
        if (state.replacementsUsed.includes(questId)) {
          toast({
            kind: 'aviso',
            title: 'Já substituíste esta missão',
            description: 'Cada missão só pode ser trocada uma vez por período.',
            icon: 'RefreshCw',
          })
          return
        }
        const isDaily = state.daily.some((quest) => quest.id === questId)
        const list = isDaily ? state.daily : state.weekly
        const quest = list.find((item) => item.id === questId)
        if (!quest || quest.completed) return

        const replacement = replacementQuest(quest, list, profile, targets)
        if (!replacement) return

        const nextList = list.map((item) => (item.id === questId ? replacement : item))
        set({
          daily: isDaily ? nextList : state.daily,
          weekly: isDaily ? state.weekly : nextList,
          replacementsUsed: [...state.replacementsUsed, questId, replacement.id],
        })
        toast({ kind: 'info', title: 'Missão substituída', description: replacement.title, icon: 'RefreshCw' })
      },

      acceptQuest: (questId) =>
        set((state) => ({
          daily: state.daily.map((quest) => (quest.id === questId ? { ...quest, accepted: true } : quest)),
          weekly: state.weekly.map((quest) => (quest.id === questId ? { ...quest, accepted: true } : quest)),
        })),

      hydrate: (daily, weekly) => set({ daily, weekly, replacementsUsed: [] }),

      reset: () => set({ daily: [], weekly: [], replacementsUsed: [] }),
    }),
    { name: 'quests', storage: createPersistStorage() },
  ),
)
