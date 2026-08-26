import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { today } from '@/services/dates'
import { createPersistStorage } from '@/services/storage'
import { useGameStore } from '@/store/gameStore'
import { useUserStore } from '@/store/userStore'
import type { BodyLog } from '@/types'

interface BodyStore {
  logs: BodyLog[]
  addLog: (log: Omit<BodyLog, 'id'>) => void
  removeLog: (id: string) => void
  hydrate: (logs: BodyLog[]) => void
  reset: () => void
}

export const useBodyStore = create<BodyStore>()(
  persist(
    (set) => ({
      logs: [],

      addLog: (log) => {
        const entry: BodyLog = { ...log, id: `body-${log.date}-${Date.now()}` }
        set((state) => ({
          // Uma pesagem por dia: a mais recente substitui a anterior.
          logs: [...state.logs.filter((item) => item.date !== log.date), entry].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
        }))
        // O peso atual do perfil acompanha a última pesagem.
        if (log.date === today()) useUserStore.getState().updateProfile({ weightKg: log.weightKg })
        const game = useGameStore.getState()
        game.incrementCounter('weightLogs')
        game.registerActivity(log.date)
        game.checkAchievements()
      },

      removeLog: (id) => set((state) => ({ logs: state.logs.filter((log) => log.id !== id) })),

      hydrate: (logs) => set({ logs }),

      reset: () => set({ logs: [] }),
    }),
    { name: 'body', storage: createPersistStorage() },
  ),
)
