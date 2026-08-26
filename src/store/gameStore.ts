import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ACHIEVEMENTS } from '@/data/achievements'
import { getCosmetic } from '@/data/cosmetics'
import { levelFromXp, titleForLevel } from '@/services/calculations'
import { daysBetween, today } from '@/services/dates'
import { STREAK_BROKEN_MESSAGE, levelUpLine } from '@/services/narrative'
import { createPersistStorage } from '@/services/storage'
import { toast } from '@/store/toastStore'
import type { AttributeKey, CosmeticSlot, GameState } from '@/types'

export type StreakStatus = 'ativa' | 'em_risco' | 'quebrada' | 'nova'

export const INITIAL_GAME_STATE: GameState = {
  xp: 0,
  level: 1,
  coins: 0,
  attributes: { forca: 1, resistencia: 1, disciplina: 1, energia: 1 },
  streak: 0,
  bestStreak: 0,
  lastActiveDate: '',
  recoveryAvailable: true,
  unlockedAchievements: {},
  inventory: [],
  equipped: {},
  counters: {
    workouts: 0,
    quests: 0,
    meals: 0,
    customWorkouts: 0,
    proteinDays: 0,
    weightLogs: 0,
  },
  proteinBonusDates: [],
  xpByDate: {},
}

interface GameStore extends GameState {
  streakStatus: StreakStatus
  addXp: (amount: number, options?: { silent?: boolean; date?: string }) => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  bumpAttribute: (attribute: AttributeKey, amount?: number) => void
  registerActivity: (date?: string) => void
  evaluateStreak: (date?: string) => void
  useRecoveryDay: () => void
  dismissStreakWarning: () => void
  incrementCounter: (key: keyof GameState['counters'], amount?: number) => void
  markProteinDay: (date: string) => boolean
  unlockCosmetic: (id: string, options?: { silent?: boolean }) => boolean
  equipCosmetic: (slot: CosmeticSlot, id: string | undefined) => void
  checkAchievements: () => string[]
  hydrateState: (state: GameState) => void
  reset: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_GAME_STATE,
      streakStatus: 'nova',

      addXp: (amount, options) => {
        if (amount <= 0) return
        const before = levelFromXp(get().xp).level
        const date = options?.date ?? today()
        set((state) => ({
          xp: state.xp + amount,
          level: levelFromXp(state.xp + amount).level,
          xpByDate: { ...state.xpByDate, [date]: (state.xpByDate[date] ?? 0) + amount },
        }))
        const after = levelFromXp(get().xp).level
        if (after > before && !options?.silent) {
          toast({
            kind: 'nivel',
            title: `Nível ${after} alcançado!`,
            description: `${titleForLevel(after)} — ${levelUpLine(after)}`,
            icon: 'Sparkles',
          })
        }
      },

      addCoins: (amount) => {
        if (amount <= 0) return
        set((state) => ({ coins: state.coins + amount }))
      },

      spendCoins: (amount) => {
        if (get().coins < amount) return false
        set((state) => ({ coins: state.coins - amount }))
        return true
      },

      bumpAttribute: (attribute, amount = 1) =>
        set((state) => ({
          attributes: { ...state.attributes, [attribute]: state.attributes[attribute] + amount },
        })),

      registerActivity: (date = today()) => {
        const state = get()
        if (state.lastActiveDate === date) return
        const gap = state.lastActiveDate ? daysBetween(state.lastActiveDate, date) : Number.POSITIVE_INFINITY
        const nextStreak = gap === 1 ? state.streak + 1 : 1
        const bestStreak = Math.max(state.bestStreak, nextStreak)
        // A cada 7 dias de sequência devolvemos o dia de recuperação.
        const recoveryAvailable =
          nextStreak > 0 && nextStreak % 7 === 0 ? true : state.recoveryAvailable
        set({
          lastActiveDate: date,
          streak: nextStreak,
          bestStreak,
          recoveryAvailable,
          streakStatus: 'ativa',
        })
        get().checkAchievements()
      },

      evaluateStreak: (date = today()) => {
        const state = get()
        if (!state.lastActiveDate) {
          set({ streakStatus: state.streak > 0 ? 'ativa' : 'nova' })
          return
        }
        const gap = daysBetween(state.lastActiveDate, date)
        if (gap <= 1) {
          set({ streakStatus: 'ativa' })
          return
        }
        if (gap === 2 && state.recoveryAvailable && state.streak > 0) {
          set({ streakStatus: 'em_risco' })
          return
        }
        if (state.streak > 0) {
          set({ streak: 0, streakStatus: 'quebrada' })
          toast({ kind: 'aviso', title: 'Sequência reiniciada', description: STREAK_BROKEN_MESSAGE, icon: 'Flame' })
        } else {
          set({ streakStatus: 'nova' })
        }
      },

      useRecoveryDay: () => {
        const state = get()
        if (!state.recoveryAvailable || state.streakStatus !== 'em_risco') return
        // Fingimos atividade "ontem" para que a sequência continue a partir de hoje.
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const iso = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(
          yesterday.getDate(),
        ).padStart(2, '0')}`
        set({ lastActiveDate: iso, recoveryAvailable: false, streakStatus: 'ativa' })
        toast({
          kind: 'sucesso',
          title: 'Dia de Recuperação usado',
          description: 'A tua sequência ficou intacta. Volta a treinar hoje para a fazer crescer.',
          icon: 'HeartPulse',
        })
      },

      dismissStreakWarning: () => set({ streakStatus: 'quebrada' }),

      incrementCounter: (key, amount = 1) =>
        set((state) => ({ counters: { ...state.counters, [key]: state.counters[key] + amount } })),

      markProteinDay: (date) => {
        const state = get()
        if (state.proteinBonusDates.includes(date)) return false
        set({
          proteinBonusDates: [...state.proteinBonusDates, date].slice(-90),
          counters: { ...state.counters, proteinDays: state.counters.proteinDays + 1 },
        })
        return true
      },

      unlockCosmetic: (id, options) => {
        const state = get()
        if (state.inventory.includes(id)) return false
        const cosmetic = getCosmetic(id)
        set({ inventory: [...state.inventory, id] })
        if (!options?.silent && cosmetic) {
          toast({
            kind: 'conquista',
            title: 'Novo cosmético desbloqueado',
            description: `${cosmetic.name} — ${cosmetic.description}`,
            icon: 'Gift',
          })
        }
        return true
      },

      equipCosmetic: (slot, id) =>
        set((state) => ({
          equipped: { ...state.equipped, [slot]: id },
        })),

      checkAchievements: () => {
        const unlockedNow: string[] = []
        // Até 3 passagens: desbloquear uma conquista dá XP e pode desbloquear outra.
        for (let pass = 0; pass < 3; pass += 1) {
          const state = get()
          const metrics: Record<string, number> = {
            workouts: state.counters.workouts,
            streak: Math.max(state.streak, state.bestStreak),
            level: levelFromXp(state.xp).level,
            proteinDays: state.counters.proteinDays,
            quests: state.counters.quests,
            meals: state.counters.meals,
            customWorkouts: state.counters.customWorkouts,
            weightLogs: state.counters.weightLogs,
          }
          const pending = ACHIEVEMENTS.filter(
            (achievement) =>
              !state.unlockedAchievements[achievement.id] && metrics[achievement.metric] >= achievement.target,
          )
          if (pending.length === 0) break

          const stamp = today()
          set((current) => ({
            unlockedAchievements: {
              ...current.unlockedAchievements,
              ...Object.fromEntries(pending.map((achievement) => [achievement.id, stamp])),
            },
          }))

          for (const achievement of pending) {
            unlockedNow.push(achievement.id)
            get().addXp(achievement.rewardXp, { silent: true })
            get().addCoins(achievement.rewardCoins)
            toast({
              kind: 'conquista',
              title: `Conquista: ${achievement.title}`,
              description: `${achievement.description} +${achievement.rewardXp} XP`,
              icon: achievement.icon,
            })
          }
        }
        return unlockedNow
      },

      hydrateState: (state) => set({ ...state, streakStatus: 'ativa' }),

      reset: () => set({ ...INITIAL_GAME_STATE, streakStatus: 'nova' }),
    }),
    {
      name: 'game',
      storage: createPersistStorage(),
      partialize: ({ streakStatus: _streakStatus, ...rest }) => rest as GameState,
    },
  ),
)

/** Seletor auxiliar: informação de nível calculada a partir do XP. */
export function selectLevelInfo(state: GameStore) {
  return levelFromXp(state.xp)
}
