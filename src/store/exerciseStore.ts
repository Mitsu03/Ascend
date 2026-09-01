import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EXERCISE_BY_ID } from '@/data/exercises'
import { createPersistStorage } from '@/services/storage'
import type { Exercise } from '@/types'

/**
 * Exercícios criados fora do catálogo local — hoje só pela geração de planos
 * por IA, que precisa de coisas que o catálogo não tem (corrida no exterior,
 * séries de intervalos, mobilidade específica).
 *
 * Os ids vêm prefixados com `ai:` para nunca colidirem com o catálogo, e o
 * catálogo tem sempre prioridade na resolução: um exercício gerado nunca
 * substitui um oficial.
 */

interface ExerciseStore {
  custom: Exercise[]
  /** Acrescenta os que ainda não existem, ignorando repetidos. */
  addExercises: (exercises: Exercise[]) => void
  reset: () => void
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set) => ({
      custom: [],

      addExercises: (exercises) =>
        set((state) => {
          const known = new Set([...Object.keys(EXERCISE_BY_ID), ...state.custom.map((item) => item.id)])
          const fresh = exercises.filter((exercise) => {
            if (known.has(exercise.id)) return false
            known.add(exercise.id)
            return true
          })
          return fresh.length > 0 ? { custom: [...state.custom, ...fresh] } : state
        }),

      reset: () => set({ custom: [] }),
    }),
    { name: 'exercises', storage: createPersistStorage() },
  ),
)

/** Resolução fora de componentes React (serviços, stores). */
export function resolveExercise(id: string): Exercise | undefined {
  return EXERCISE_BY_ID[id] ?? useExerciseStore.getState().custom.find((item) => item.id === id)
}

/**
 * Resolução dentro de componentes. Devolve uma função estável enquanto a lista
 * de exercícios gerados não mudar, para não invalidar memos à toa.
 */
export function useExerciseResolver(): (id: string) => Exercise | undefined {
  const custom = useExerciseStore((state) => state.custom)
  return useMemo(
    () => (id: string) => EXERCISE_BY_ID[id] ?? custom.find((item) => item.id === id),
    [custom],
  )
}
