/** Pequenos textos narrativos apresentados no Dashboard. */

export interface NarrativeContext {
  name: string
  streak: number
  questsRemaining: number
  workoutDoneToday: boolean
  hasWorkoutToday: boolean
  caloriesProgress: number
  proteinProgress: number
  levelUpToday: boolean
}

export function narrativeForDay(context: NarrativeContext): string {
  if (context.levelUpToday) {
    return 'Subiste de nível. A tua aura mudou — e o espelho vai notar antes de ti.'
  }
  if (context.workoutDoneToday && context.questsRemaining === 0) {
    return 'Dia completo. Treino feito, missões limpas. Descansa: é aí que a força se consolida.'
  }
  if (context.workoutDoneToday) {
    return `Treino concluído. Faltam ${context.questsRemaining} ${
      context.questsRemaining === 1 ? 'missão' : 'missões'
    } para fechares o dia em pleno.`
  }
  if (context.hasWorkoutToday && context.streak >= 3) {
    return `${context.streak} dias seguidos. O teu treino de hoje espera-te — não deixes a chama apagar-se.`
  }
  if (context.hasWorkoutToday) {
    return 'A tua energia está a crescer. Completa uma missão para desbloquear XP.'
  }
  if (context.proteinProgress < 0.5 && context.caloriesProgress > 0.6) {
    return 'As calorias sobem mais depressa que a proteína. Equilibra o próximo prato.'
  }
  if (context.caloriesProgress < 0.2) {
    return 'O dia ainda está por escrever. Regista a primeira refeição e ganha impulso.'
  }
  if (context.streak === 0) {
    return 'Todo o herói tem contratempos. Hoje é um bom dia para recomeçar a contagem.'
  }
  return 'Dia de recuperação. Move-te devagar, hidrata-te e volta mais forte amanhã.'
}

const LEVEL_UP_LINES = [
  'Sentes isso? É a barra a ficar mais leve.',
  'Novo nível, novo patamar. Continua.',
  'A tua disciplina acabou de se tornar visível.',
  'Mais um degrau na ascensão.',
]

export function levelUpLine(level: number): string {
  return LEVEL_UP_LINES[level % LEVEL_UP_LINES.length]
}

const WORKOUT_DONE_LINES = [
  'Sessão fechada. O corpo lembra-se do que fizeste hoje.',
  'Mais um treino no registo. A consistência é a tua arma.',
  'Trabalho feito. Agora come bem e dorme melhor.',
  'Cada série contou. Bem jogado.',
]

export function workoutDoneLine(seed: number): string {
  return WORKOUT_DONE_LINES[Math.abs(seed) % WORKOUT_DONE_LINES.length]
}

export const STREAK_BROKEN_MESSAGE =
  'A tua sequência foi interrompida — acontece a todos. Sem penalizações: recomeça hoje e a chama volta a acender.'

export const STREAK_AT_RISK_MESSAGE =
  'Falhaste ontem, mas ainda tens um Dia de Recuperação disponível. Usa-o para manter a sequência viva.'
