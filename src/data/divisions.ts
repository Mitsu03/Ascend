import { localized as l } from '@/i18n/types'
import type { ArtIconName } from '@/data/artIcons'
import type { Localized } from '@/i18n/types'
import type { Goal } from '@/types'

/**
 * As treze divisões do Gotei 13.
 *
 * Cada divisão dá ao utilizador uma identidade visual — emblema, cor de
 * reiatsu e lema — e uma inclinação de treino. A inclinação não altera cálculos
 * nem dá vantagem: serve para sugerir uma divisão no onboarding a partir do
 * objetivo e para dar contexto às frases da aplicação.
 *
 * As funções de cada divisão seguem o que é próprio de cada uma no Gotei: a
 * 2.ª é o Onmitsukidō, a 4.ª trata de cura e abastecimento, a 9.ª de
 * comunicação e segurança interna, a 11.ª é a divisão de combate direto e a
 * 12.ª é o Instituto de Investigação. As restantes não têm especialidade fixa,
 * por isso a inclinação de treino é a leitura desta aplicação, não cânone.
 */

/** Eixo de treino a que a divisão se inclina. */
export type DivisionFocus = 'forca' | 'resistencia' | 'disciplina' | 'energia'

export interface Division {
  /** 1 a 13 */
  id: number
  name: Localized
  /** Especialidade da divisão dentro do Gotei. */
  role: Localized
  /** Lema apresentado no quartel e na ficha de Shinigami. */
  motto: Localized
  /** Como a divisão treina — usado para a sugerir a partir do objetivo. */
  focus: DivisionFocus
  /** Emblema de game-icons.net (CC BY 3.0) que representa a divisão. */
  emblem: ArtIconName
  /** Cor do reiatsu da divisão, em CSS. */
  color: string
}

export const DIVISIONS: Division[] = [
  {
    id: 1,
    name: l('Primeira Divisão', 'First Division'),
    role: l('Comando-geral do Gotei 13', 'High command of the Gotei 13'),
    motto: l('Quem comanda é o primeiro a levantar-se.', 'Whoever commands is the first to rise.'),
    focus: 'disciplina',
    emblem: 'laurel-crown',
    color: '#d8d3c4',
  },
  {
    id: 2,
    name: l('Segunda Divisão', 'Second Division'),
    role: l('Forças Especiais — Onmitsukidō', 'Special Forces — the Onmitsukidō'),
    motto: l('Chegar sem ser visto.', 'Arrive without being seen.'),
    focus: 'resistencia',
    emblem: 'midnight-claw',
    color: '#7f8cff',
  },
  {
    id: 3,
    name: l('Terceira Divisão', 'Third Division'),
    role: l('Linha da frente e reforço', 'Front line and reinforcement'),
    motto: l('Voltar a levantar-se é a única técnica.', 'Standing up again is the only technique.'),
    focus: 'disciplina',
    emblem: 'crescent-blade',
    color: '#9be8a0',
  },
  {
    id: 4,
    name: l('Quarta Divisão', 'Fourth Division'),
    role: l('Cura, socorro e abastecimento', 'Healing, relief and supply'),
    motto: l('Recuperar também é treinar.', 'Recovering is training too.'),
    focus: 'energia',
    emblem: 'soul-vessel',
    color: '#8fd4ff',
  },
  {
    id: 5,
    name: l('Quinta Divisão', 'Fifth Division'),
    role: l('Kidō e instrução', 'Kidō and instruction'),
    motto: l('A técnica vence a pressa.', 'Technique beats haste.'),
    focus: 'disciplina',
    emblem: 'fire-ray',
    color: '#ff9f5a',
  },
  {
    id: 6,
    name: l('Sexta Divisão', 'Sixth Division'),
    role: l('Ordem e protocolo', 'Order and protocol'),
    motto: l('Nada de excessos. Nada de faltas.', 'No excess. No absence.'),
    focus: 'disciplina',
    emblem: 'sword-array',
    color: '#f2a7c3',
  },
  {
    id: 7,
    name: l('Sétima Divisão', 'Seventh Division'),
    role: l('Força bruta e defesa da linha', 'Brute strength, holding the line'),
    motto: l('O que aguenta é o que fica.', 'What holds is what stays.'),
    focus: 'forca',
    emblem: 'samurai-helmet',
    color: '#c9a227',
  },
  {
    id: 8,
    name: l('Oitava Divisão', 'Eighth Division'),
    role: l('Coordenação e moral da tropa', 'Coordination and troop morale'),
    motto: l('Treina hoje o que queres ser amanhã.', 'Train today what you want to be tomorrow.'),
    focus: 'energia',
    emblem: 'wing-cloak',
    color: '#e8b6ff',
  },
  {
    id: 9,
    name: l('Nona Divisão', 'Ninth Division'),
    role: l('Comunicação e segurança interna', 'Communications and internal security'),
    motto: l('Regista tudo. O que não se mede, perde-se.', 'Record everything. What is not measured is lost.'),
    focus: 'disciplina',
    emblem: 'scroll-unfurled',
    color: '#b9c6d6',
  },
  {
    id: 10,
    name: l('Décima Divisão', 'Tenth Division'),
    role: l('Patrulha e resposta rápida', 'Patrol and rapid response'),
    motto: l('Cabeça fria, pernas em fogo.', 'Cold head, legs on fire.'),
    focus: 'resistencia',
    emblem: 'concentric-crescents',
    color: '#7fe6e0',
  },
  {
    id: 11,
    name: l('Décima Primeira Divisão', 'Eleventh Division'),
    role: l('Combate direto — só zanjutsu', 'Direct combat — zanjutsu only'),
    motto: l('Sem kidō. Sem desculpas.', 'No kidō. No excuses.'),
    focus: 'forca',
    emblem: 'crossed-swords',
    color: '#e8365c',
  },
  {
    id: 12,
    name: l('Décima Segunda Divisão', 'Twelfth Division'),
    role: l('Instituto de Investigação e Desenvolvimento', 'Research and Development Institute'),
    motto: l('Mede, ajusta, repete.', 'Measure, adjust, repeat.'),
    focus: 'disciplina',
    emblem: 'third-eye',
    color: '#9dff6b',
  },
  {
    id: 13,
    name: l('Décima Terceira Divisão', 'Thirteenth Division'),
    role: l('Vigilância e apoio de retaguarda', 'Watch and rear-guard support'),
    motto: l('A constância vale mais do que a intensidade.', 'Steadiness is worth more than intensity.'),
    focus: 'energia',
    emblem: 'moon',
    color: '#a9b8ff',
  },
]

export const DIVISION_BY_ID: Record<number, Division> = Object.fromEntries(
  DIVISIONS.map((division) => [division.id, division]),
)

/** Divisão por omissão quando o perfil ainda não tem nenhuma escolhida. */
export const DEFAULT_DIVISION_ID = 13

export function getDivision(id: number | undefined): Division {
  return DIVISION_BY_ID[id ?? DEFAULT_DIVISION_ID] ?? DIVISION_BY_ID[DEFAULT_DIVISION_ID]
}

/**
 * Divisão sugerida no onboarding a partir do objetivo. É apenas a opção
 * pré-selecionada — o utilizador escolhe qualquer uma das treze.
 */
const SUGGESTED_BY_GOAL: Record<Goal, number> = {
  ganhar_massa: 11,
  perder_gordura: 2,
  condicao_fisica: 10,
  manter: 4,
}

export function suggestedDivision(goal: Goal): number {
  return SUGGESTED_BY_GOAL[goal] ?? DEFAULT_DIVISION_ID
}
