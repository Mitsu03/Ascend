import {
  DAILY_QUEST_TEMPLATES,
  SPECIAL_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
} from '@/data/quests'
import { dayOfWeek } from '@/services/dates'
import type { MacroTargets, Quest, QuestTemplate, UserProfile, WorkoutDay } from '@/types'

/** Gera missões diárias, semanais e desafios especiais adaptados ao perfil. */

function seededRandom(seed: string): () => number {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Ajusta o alvo do template ao perfil e às metas do utilizador. */
function resolveTarget(template: QuestTemplate, profile: UserProfile, targets: MacroTargets | null): number {
  switch (template.type) {
    case 'proteina': {
      if (!targets) return template.baseTarget
      if (template.period === 'diaria' && template.id === 'd-proteina') {
        return Math.round(targets.proteinG * 0.9)
      }
      return template.baseTarget
    }
    case 'passos': {
      const bonus = profile.level === 'avancado' ? 2000 : profile.level === 'intermedio' ? 1000 : 0
      return template.baseTarget + (template.period === 'semanal' ? bonus * 7 : bonus)
    }
    case 'agua': {
      if (template.period === 'diaria' && template.id === 'd-agua') {
        // ~35 ml por kg, arredondado a 250 ml.
        return Math.max(2000, Math.round((profile.weightKg * 35) / 250) * 250)
      }
      return template.baseTarget
    }
    case 'treino': {
      if (template.period === 'semanal') return Math.max(2, profile.daysPerWeek)
      return template.baseTarget
    }
    default:
      return template.baseTarget
  }
}

function toQuest(
  template: QuestTemplate,
  profile: UserProfile,
  targets: MacroTargets | null,
  date: string,
  suffix = '',
): Quest {
  return {
    id: `${template.id}-${date}${suffix}`,
    templateId: template.id,
    type: template.type,
    period: template.period,
    title: template.title,
    description: template.description,
    unit: template.unit,
    target: resolveTarget(template, profile, targets),
    progress: 0,
    rewardXp: template.rewardXp,
    rewardCoins: template.rewardCoins,
    rewardItem: template.rewardItem,
    manualStep: template.manualStep,
    attribute: template.attribute,
    completed: false,
    date,
    accepted: template.period !== 'especial',
    replaced: false,
  }
}

/** 3 missões diárias com tipos distintos. Em dia de treino inclui sempre a de treino. */
export function generateDailyQuests(
  profile: UserProfile,
  targets: MacroTargets | null,
  date: string,
  plan: WorkoutDay[],
): Quest[] {
  const random = seededRandom(`${profile.name}|${date}`)
  const isTrainingDay = plan.some((day) => day.dayOfWeek === dayOfWeek(date))

  const chosen: QuestTemplate[] = []
  const usedTypes = new Set<string>()

  if (isTrainingDay) {
    const trainingTemplate = DAILY_QUEST_TEMPLATES.find((t) => t.id === 'd-treino-completo')
    if (trainingTemplate) {
      chosen.push(trainingTemplate)
      usedTypes.add(trainingTemplate.type)
    }
  }

  for (const template of shuffle(DAILY_QUEST_TEMPLATES, random)) {
    if (chosen.length >= 3) break
    if (usedTypes.has(template.type)) continue
    chosen.push(template)
    usedTypes.add(template.type)
  }

  return chosen.map((template) => toQuest(template, profile, targets, date))
}

/** 2 missões semanais + 1 desafio especial por semana. */
export function generateWeeklyQuests(
  profile: UserProfile,
  targets: MacroTargets | null,
  weekStart: string,
): Quest[] {
  const random = seededRandom(`${profile.name}|semana|${weekStart}`)
  const weekly = shuffle(WEEKLY_QUEST_TEMPLATES, random).slice(0, 2)
  const special = shuffle(SPECIAL_QUEST_TEMPLATES, random)[0]
  const quests = weekly.map((template) => toQuest(template, profile, targets, weekStart))
  if (special) quests.push(toQuest(special, profile, targets, weekStart))
  return quests
}

/** Substitui uma missão por outra do mesmo período, com tipo diferente dos ativos. */
export function replacementQuest(
  quest: Quest,
  activeQuests: Quest[],
  profile: UserProfile,
  targets: MacroTargets | null,
): Quest | null {
  const pool = quest.period === 'diaria' ? DAILY_QUEST_TEMPLATES : WEEKLY_QUEST_TEMPLATES
  const usedTemplates = new Set(activeQuests.map((item) => item.templateId))
  const usedTypes = new Set(activeQuests.filter((item) => item.id !== quest.id).map((item) => item.type))
  const random = seededRandom(`${quest.id}|substituir`)

  const candidates = shuffle(pool, random).filter(
    (template) => !usedTemplates.has(template.id) && !usedTypes.has(template.type),
  )
  const fallback = shuffle(pool, random).filter((template) => !usedTemplates.has(template.id))
  const template = candidates[0] ?? fallback[0]
  if (!template) return null

  const replacement = toQuest(template, profile, targets, quest.date, '-r')
  replacement.replaced = true
  return replacement
}
