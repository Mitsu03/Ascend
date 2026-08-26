import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFood } from '@/data/foods'
import { getDictionary } from '@/i18n'
import { today, weekDates } from '@/services/dates'
import { createPersistStorage } from '@/services/storage'
import { useGameStore } from '@/store/gameStore'
import { useQuestStore } from '@/store/questStore'
import { toast } from '@/store/toastStore'
import type { DailyTotals, MacroTargets, MealEntry, MealType } from '@/types'

export const EMPTY_TOTALS: DailyTotals = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }

export const MEAL_ORDER: MealType[] = ['pequeno_almoco', 'almoco', 'lanche', 'jantar', 'snack']

/** Missões de proteína medidas em gramas no próprio dia. */
const PROTEIN_GRAM_QUESTS = new Set(['d-proteina', 'd-pequeno-almoco'])
/** Missões de proteína medidas em dias cumpridos. */
const PROTEIN_DAY_QUESTS = new Set(['w-proteina', 's-forja'])

interface NutritionStore {
  entries: MealEntry[]
  waterByDate: Record<string, number>
  addEntry: (mealType: MealType, foodId: string, grams: number, date?: string) => void
  removeEntry: (id: string) => void
  addWater: (ml: number, date?: string) => void
  entriesForDate: (date?: string) => MealEntry[]
  totalsForDate: (date?: string) => DailyTotals
  waterForDate: (date?: string) => number
  hydrate: (entries: MealEntry[], waterByDate: Record<string, number>) => void
  reset: () => void
}

export function entryMacros(entry: MealEntry): DailyTotals {
  const food = getFood(entry.foodId)
  if (!food) return EMPTY_TOTALS
  const factor = entry.grams / 100
  return {
    calories: Math.round(food.per100g.calories * factor),
    proteinG: Math.round(food.per100g.proteinG * factor),
    carbsG: Math.round(food.per100g.carbsG * factor),
    fatG: Math.round(food.per100g.fatG * factor),
  }
}

export function sumEntries(entries: MealEntry[]): DailyTotals {
  return entries.reduce((acc, entry) => {
    const macros = entryMacros(entry)
    return {
      calories: acc.calories + macros.calories,
      proteinG: acc.proteinG + macros.proteinG,
      carbsG: acc.carbsG + macros.carbsG,
      fatG: acc.fatG + macros.fatG,
    }
  }, EMPTY_TOTALS)
}

export function remainingMacros(totals: DailyTotals, targets: MacroTargets | null): DailyTotals {
  if (!targets) return EMPTY_TOTALS
  return {
    calories: Math.max(0, targets.calories - totals.calories),
    proteinG: Math.max(0, targets.proteinG - totals.proteinG),
    carbsG: Math.max(0, targets.carbsG - totals.carbsG),
    fatG: Math.max(0, targets.fatG - totals.fatG),
  }
}

let counter = 0

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      entries: [],
      waterByDate: {},

      addEntry: (mealType, foodId, grams, date = today()) => {
        if (grams <= 0 || !getFood(foodId)) return
        counter += 1
        const entry: MealEntry = {
          id: `meal-${Date.now()}-${counter}`,
          date,
          mealType,
          foodId,
          grams: Math.round(grams),
        }
        set((state) => ({ entries: [entry, ...state.entries] }))

        const game = useGameStore.getState()
        game.incrementCounter('meals')
        game.registerActivity(date)

        const quests = useQuestStore.getState()
        const totals = get().totalsForDate(date)
        // As missões diárias de proteína usam o total do dia, não o incremento.
        for (const quest of quests.daily) {
          if (PROTEIN_GRAM_QUESTS.has(quest.templateId) && quest.date === date && !quest.completed) {
            quests.setProgress(quest.id, totals.proteinG)
          }
        }
        // Missão "Diário completo" conta refeições registadas no dia.
        const mealsToday = get().entriesForDate(date).length
        for (const quest of quests.daily) {
          if (quest.templateId === 'd-registo-refeicoes' && !quest.completed) {
            quests.setProgress(quest.id, mealsToday)
          }
        }
        // Missão semanal "Cronista disciplinado" conta dias distintos com registos.
        const week = new Set(weekDates(date))
        const daysLogged = new Set(
          get().entries.filter((entry) => week.has(entry.date)).map((entry) => entry.date),
        ).size
        for (const quest of quests.weekly) {
          if (quest.templateId === 'w-registo' && !quest.completed) {
            quests.setProgress(quest.id, daysLogged)
          }
        }

        game.checkAchievements()
      },

      removeEntry: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),

      addWater: (ml, date = today()) => {
        if (ml <= 0) return
        set((state) => ({
          waterByDate: { ...state.waterByDate, [date]: (state.waterByDate[date] ?? 0) + ml },
        }))
        useQuestStore.getState().addProgress('agua', ml)
        useGameStore.getState().registerActivity(date)
      },

      entriesForDate: (date = today()) => get().entries.filter((entry) => entry.date === date),

      totalsForDate: (date = today()) => sumEntries(get().entriesForDate(date)),

      waterForDate: (date = today()) => get().waterByDate[date] ?? 0,

      hydrate: (entries, waterByDate) => set({ entries, waterByDate }),

      reset: () => set({ entries: [], waterByDate: {} }),
    }),
    { name: 'nutrition', storage: createPersistStorage() },
  ),
)

/**
 * Atribui o bónus diário de proteína quando o utilizador atinge 90% da meta.
 * Chamado pela UI de nutrição após cada registo.
 */
export function checkProteinBonus(targets: MacroTargets | null, date = today()): void {
  if (!targets) return
  const totals = useNutritionStore.getState().totalsForDate(date)
  if (totals.proteinG < targets.proteinG * 0.9) return
  const game = useGameStore.getState()
  if (!game.markProteinDay(date)) return
  game.addXp(25)
  game.bumpAttribute('disciplina')
  // Missões semanais/especiais de proteína contam dias, não gramas.
  const quests = useQuestStore.getState()
  for (const quest of quests.weekly) {
    if (PROTEIN_DAY_QUESTS.has(quest.templateId) && !quest.completed) {
      quests.setProgress(quest.id, quest.progress + 1)
    }
  }
  const t = getDictionary()
  toast({
    kind: 'sucesso',
    title: t.toasts.proteinGoal,
    description: t.toasts.proteinGoalDetail,
    icon: 'Beef',
  })
  game.checkAchievements()
}
