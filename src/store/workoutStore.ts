import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BONUS_REWARD_POOL, getCosmetic } from '@/data/cosmetics'
import { BONUS_REWARD_CHANCE, workoutRewards } from '@/services/calculations'
import { dayOfWeek, today } from '@/services/dates'
import { totalSets as sumSets } from '@/services/planGenerator'
import { createPersistStorage } from '@/services/storage'
import { useGameStore } from '@/store/gameStore'
import { useQuestStore } from '@/store/questStore'
import { toast } from '@/store/toastStore'
import type { ActiveSession, WorkoutDay, WorkoutSessionLog } from '@/types'

export interface SessionResult {
  log: WorkoutSessionLog
  levelBefore: number
  levelAfter: number
  bonusRewardId?: string
  attributes: { forca: number; resistencia: number; disciplina: number }
}

interface WorkoutStore {
  plan: WorkoutDay[]
  history: WorkoutSessionLog[]
  activeSession: ActiveSession | null
  lastResult: SessionResult | null
  setPlan: (plan: WorkoutDay[]) => void
  addCustomWorkout: (workout: WorkoutDay) => void
  updateWorkout: (workout: WorkoutDay) => void
  removeWorkout: (id: string) => void
  startSession: (workoutDayId: string) => void
  toggleSet: (exerciseIndex: number, setIndex: number) => void
  togglePause: () => void
  abandonSession: () => void
  finishSession: () => SessionResult | null
  clearLastResult: () => void
  elapsedSeconds: () => number
  workoutForDate: (date?: string) => WorkoutDay | undefined
  isCompletedOn: (workoutDayId: string, date: string) => boolean
  hydrate: (plan: WorkoutDay[], history: WorkoutSessionLog[]) => void
  reset: () => void
}

function elapsedFrom(session: ActiveSession): number {
  if (session.paused) return session.accumulatedSeconds
  return session.accumulatedSeconds + Math.floor((Date.now() - session.startedAt) / 1000)
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      plan: [],
      history: [],
      activeSession: null,
      lastResult: null,

      setPlan: (plan) => set({ plan }),

      addCustomWorkout: (workout) => {
        set((state) => ({ plan: [...state.plan, workout] }))
        const game = useGameStore.getState()
        game.incrementCounter('customWorkouts')
        game.checkAchievements()
      },

      updateWorkout: (workout) =>
        set((state) => ({ plan: state.plan.map((day) => (day.id === workout.id ? workout : day)) })),

      removeWorkout: (id) => set((state) => ({ plan: state.plan.filter((day) => day.id !== id) })),

      startSession: (workoutDayId) => {
        const workout = get().plan.find((day) => day.id === workoutDayId)
        if (!workout) return
        set({
          activeSession: {
            workoutDayId,
            startedAt: Date.now(),
            accumulatedSeconds: 0,
            paused: false,
            checked: workout.exercises.map((exercise) => Array<boolean>(exercise.sets).fill(false)),
          },
          lastResult: null,
        })
      },

      toggleSet: (exerciseIndex, setIndex) =>
        set((state) => {
          if (!state.activeSession) return state
          const checked = state.activeSession.checked.map((row, index) =>
            index === exerciseIndex ? row.map((value, i) => (i === setIndex ? !value : value)) : row,
          )
          return { activeSession: { ...state.activeSession, checked } }
        }),

      togglePause: () =>
        set((state) => {
          const session = state.activeSession
          if (!session) return state
          if (session.paused) {
            return { activeSession: { ...session, paused: false, startedAt: Date.now() } }
          }
          return {
            activeSession: {
              ...session,
              paused: true,
              accumulatedSeconds: elapsedFrom(session),
            },
          }
        }),

      abandonSession: () => set({ activeSession: null }),

      finishSession: () => {
        const state = get()
        const session = state.activeSession
        if (!session) return null
        const workout = state.plan.find((day) => day.id === session.workoutDayId)
        if (!workout) {
          set({ activeSession: null })
          return null
        }

        const completedSets = session.checked.flat().filter(Boolean).length
        const total = sumSets(workout.exercises)
        const durationSeconds = elapsedFrom(session)
        const rewards = workoutRewards(completedSets, total, durationSeconds)

        const game = useGameStore.getState()
        const levelBefore = game.level

        // Recompensa aleatória moderada: só cosméticos, nunca vantagem de jogo.
        let bonusRewardId: string | undefined
        const owned = new Set(game.inventory)
        const candidates = BONUS_REWARD_POOL.filter((id) => !owned.has(id))
        if (candidates.length > 0 && Math.random() < BONUS_REWARD_CHANCE) {
          bonusRewardId = candidates[Math.floor(Math.random() * candidates.length)]
        }

        const log: WorkoutSessionLog = {
          id: `session-${Date.now()}`,
          workoutDayId: workout.id,
          workoutName: workout.name,
          date: today(),
          durationSeconds,
          completedSets,
          totalSets: total,
          xpEarned: rewards.xp,
          coinsEarned: rewards.coins,
          bonusRewardId,
        }

        game.addXp(rewards.xp, { silent: true })
        game.addCoins(rewards.coins)
        game.bumpAttribute('forca')
        game.bumpAttribute('resistencia')
        if (rewards.completionRate >= 1) game.bumpAttribute('disciplina')
        game.incrementCounter('workouts')
        game.registerActivity()
        if (bonusRewardId) {
          game.unlockCosmetic(bonusRewardId, { silent: true })
        } else {
          // Sem cosmético, uma compensação simbólica em moedas.
          game.addCoins(15)
        }
        game.checkAchievements()

        useQuestStore.getState().addProgress('treino', 1)

        const levelAfter = useGameStore.getState().level
        const cosmetic = bonusRewardId ? getCosmetic(bonusRewardId) : undefined
        if (cosmetic) {
          toast({
            kind: 'conquista',
            title: 'Recompensa surpresa!',
            description: `${cosmetic.name} foi adicionado ao teu inventário.`,
            icon: 'Gift',
          })
        }

        const result: SessionResult = {
          log,
          levelBefore,
          levelAfter,
          bonusRewardId,
          attributes: {
            forca: 1,
            resistencia: 1,
            disciplina: rewards.completionRate >= 1 ? 1 : 0,
          },
        }

        set((current) => ({
          history: [log, ...current.history].slice(0, 200),
          activeSession: null,
          lastResult: result,
        }))

        return result
      },

      clearLastResult: () => set({ lastResult: null }),

      elapsedSeconds: () => {
        const session = get().activeSession
        return session ? elapsedFrom(session) : 0
      },

      workoutForDate: (date = today()) => {
        const weekday = dayOfWeek(date)
        return get().plan.find((day) => day.dayOfWeek === weekday)
      },

      isCompletedOn: (workoutDayId, date) =>
        get().history.some((log) => log.workoutDayId === workoutDayId && log.date === date),

      hydrate: (plan, history) => set({ plan, history, activeSession: null, lastResult: null }),

      reset: () => set({ plan: [], history: [], activeSession: null, lastResult: null }),
    }),
    {
      name: 'workouts',
      storage: createPersistStorage(),
      partialize: (state) => ({
        plan: state.plan,
        history: state.history,
        activeSession: state.activeSession,
      }),
    },
  ),
)
