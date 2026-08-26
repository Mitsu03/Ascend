import type { Dictionary } from '@/i18n'

/** Pequenos textos narrativos apresentados no Dashboard. */

export interface NarrativeContext {
  streak: number
  questsRemaining: number
  workoutDoneToday: boolean
  hasWorkoutToday: boolean
  caloriesProgress: number
  proteinProgress: number
  levelUpToday: boolean
}

export function narrativeForDay(context: NarrativeContext, t: Dictionary): string {
  const n = t.narrative
  if (context.levelUpToday) return n.levelUpToday
  if (context.workoutDoneToday && context.questsRemaining === 0) return n.dayComplete
  if (context.workoutDoneToday) return n.workoutDone(context.questsRemaining)
  if (context.hasWorkoutToday && context.streak >= 3) return n.streakWithWorkout(context.streak)
  if (context.hasWorkoutToday) return n.hasWorkout
  if (context.proteinProgress < 0.5 && context.caloriesProgress > 0.6) return n.proteinLagging
  if (context.caloriesProgress < 0.2) return n.dayStart
  if (context.streak === 0) return n.noStreak
  return n.restDay
}

export function levelUpLine(level: number, t: Dictionary): string {
  const lines = t.narrative.levelUpLines
  return lines[level % lines.length]
}

export function workoutDoneLine(seed: number, t: Dictionary): string {
  const lines = t.narrative.workoutDoneLines
  return lines[Math.abs(seed) % lines.length]
}
