import { localized as l } from '@/i18n/types'
import type { Achievement } from '@/types'

/** As 10 conquistas iniciais da Ascend. */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'primeiro-passo',
    title: l('Primeiro Passo', 'First Step'),
    description: l(
      'Completa o teu primeiro treino. Toda a jornada começa aqui.',
      'Complete your first session. Every journey starts here.',
    ),
    icon: 'Footprints',
    target: 1,
    metric: 'workouts',
    rewardXp: 50,
    rewardCoins: 20,
  },
  {
    id: 'chama-acesa',
    title: l('Chama Acesa', 'Lit Flame'),
    description: l('Mantém uma sequência de 3 dias ativos.', 'Keep a 3-day active streak.'),
    icon: 'Flame',
    target: 3,
    metric: 'streak',
    rewardXp: 60,
    rewardCoins: 25,
  },
  {
    id: 'semana-de-ferro',
    title: l('Semana de Ferro', 'Week of Iron'),
    description: l(
      'Sete dias consecutivos de atividade. A disciplina começa a ser hábito.',
      'Seven consecutive active days. Discipline is becoming habit.',
    ),
    icon: 'CalendarCheck',
    target: 7,
    metric: 'streak',
    rewardXp: 120,
    rewardCoins: 50,
  },
  {
    id: 'guerreiro-dedicado',
    title: l('Guerreiro Dedicado', 'Dedicated Warrior'),
    description: l('Completa 10 treinos.', 'Complete 10 sessions.'),
    icon: 'Dumbbell',
    target: 10,
    metric: 'workouts',
    rewardXp: 130,
    rewardCoins: 55,
  },
  {
    id: 'mestre-proteina',
    title: l('Mestre da Proteína', 'Protein Master'),
    description: l(
      'Atinge a meta diária de proteína em 5 dias.',
      'Hit your daily protein target on 5 days.',
    ),
    icon: 'Beef',
    target: 5,
    metric: 'proteinDays',
    rewardXp: 110,
    rewardCoins: 45,
  },
  {
    id: 'ascensao',
    title: l('Ascensão', 'Ascension'),
    description: l('Alcança o nível 10.', 'Reach level 10.'),
    icon: 'TrendingUp',
    target: 10,
    metric: 'level',
    rewardXp: 200,
    rewardCoins: 100,
  },
  {
    id: 'cacador-missoes',
    title: l('Caçador de Missões', 'Quest Hunter'),
    description: l('Conclui 20 missões.', 'Complete 20 quests.'),
    icon: 'Target',
    target: 20,
    metric: 'quests',
    rewardXp: 150,
    rewardCoins: 60,
  },
  {
    id: 'chef-heroi',
    title: l('Chef Herói', 'Hero Chef'),
    description: l(
      'Regista 50 refeições no diário alimentar.',
      'Log 50 meals in your food diary.',
    ),
    icon: 'UtensilsCrossed',
    target: 50,
    metric: 'meals',
    rewardXp: 140,
    rewardCoins: 55,
  },
  {
    id: 'arquiteto',
    title: l('Arquiteto do Treino', 'Training Architect'),
    description: l(
      'Cria o teu primeiro treino personalizado.',
      'Create your first custom session.',
    ),
    icon: 'Hammer',
    target: 1,
    metric: 'customWorkouts',
    rewardXp: 80,
    rewardCoins: 30,
  },
  {
    id: 'observador',
    title: l('Observador do Progresso', 'Progress Watcher'),
    description: l(
      'Regista 5 pesagens e acompanha a evolução.',
      'Log 5 weigh-ins and follow your progress.',
    ),
    icon: 'LineChart',
    target: 5,
    metric: 'weightLogs',
    rewardXp: 90,
    rewardCoins: 35,
  },
]

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id)
}
