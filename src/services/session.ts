import { buildDemoData } from '@/data/demoUser'
import { today } from '@/services/dates'
import { generateWeeklyPlan } from '@/services/planGenerator'
import { wipeAllData } from '@/services/storage'
import { useBodyStore } from '@/store/bodyStore'
import { useGameStore } from '@/store/gameStore'
import { useNutritionStore } from '@/store/nutritionStore'
import { useQuestStore } from '@/store/questStore'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'
import type { UserProfile } from '@/types'

/**
 * Orquestração entre stores: arranque diário, onboarding, carregamento da
 * demonstração e reposição de dados.
 */

/** Corre a cada arranque da app: avalia a sequência e garante missões do dia. */
export function bootstrapSession(): void {
  const { profile, targets } = useUserStore.getState()
  if (!profile) return
  const game = useGameStore.getState()
  game.evaluateStreak(today())
  useQuestStore.getState().ensureQuests(profile, targets, useWorkoutStore.getState().plan, today())
}

/** Conclui o onboarding: guarda o perfil, gera plano e missões. */
export function completeOnboarding(profile: UserProfile): void {
  const user = useUserStore.getState()
  user.setProfile(profile)
  const targets = useUserStore.getState().targets

  const plan = generateWeeklyPlan(profile)
  useWorkoutStore.getState().hydrate(plan, [])
  useNutritionStore.getState().reset()
  useBodyStore.getState().hydrate([
    { id: `body-inicial-${today()}`, date: today(), weightKg: profile.weightKg },
  ])
  useGameStore.getState().reset()
  useGameStore.getState().registerActivity(today())
  useQuestStore.getState().reset()
  useQuestStore.getState().ensureQuests(profile, targets, plan, today())
}

/** Carrega o perfil de demonstração (Kai, nível 7). */
export function loadDemoProfile(): void {
  const demo = buildDemoData()
  useUserStore.getState().setProfile(demo.profile, { isDemo: true })
  useGameStore.getState().hydrateState(demo.game)
  useWorkoutStore.getState().hydrate(demo.plan, demo.history)
  useNutritionStore.getState().hydrate(demo.entries, demo.waterByDate)
  useQuestStore.getState().hydrate(demo.daily, demo.weekly)
  useBodyStore.getState().hydrate(demo.bodyLogs)
}

/** Apaga tudo e devolve a app ao ecrã inicial. */
export function resetEverything(): void {
  useUserStore.getState().reset()
  useGameStore.getState().reset()
  useWorkoutStore.getState().reset()
  useNutritionStore.getState().reset()
  useQuestStore.getState().reset()
  useBodyStore.getState().reset()
  wipeAllData()
}
