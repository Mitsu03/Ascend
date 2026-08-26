import type { CosmeticItem, CosmeticSlot, Rarity } from '@/types'

/**
 * Cosméticos puramente estéticos. As moedas do MVP servem apenas para isto —
 * não existe qualquer vantagem de jogo associada.
 */
export const COSMETICS: CosmeticItem[] = [
  // Molduras do avatar
  {
    id: 'moldura-ferro',
    name: 'Moldura de Ferro',
    slot: 'frame',
    rarity: 'comum',
    description: 'Um contorno sóbrio para quem começou a levar a sério.',
    price: 120,
    value: '#64748b',
  },
  {
    id: 'moldura-aurora',
    name: 'Moldura Aurora',
    slot: 'frame',
    rarity: 'raro',
    description: 'Contorno em gradiente ciano-violeta, como o céu antes do treino da manhã.',
    price: 260,
    value: 'linear-gradient(135deg, #22d3ee, #7c3aed)',
  },
  {
    id: 'moldura-solar',
    name: 'Moldura Solar',
    slot: 'frame',
    rarity: 'epico',
    description: 'Ouro fundido. Reservada a quem não falha.',
    price: 480,
    value: 'linear-gradient(135deg, #fbbf24, #f97316)',
  },

  // Títulos
  {
    id: 'titulo-novato',
    name: 'Novato Determinado',
    slot: 'title',
    rarity: 'comum',
    description: 'Todo o herói começa aqui.',
    price: 80,
    value: 'Novato Determinado',
  },
  {
    id: 'titulo-lamina',
    name: 'Lâmina do Amanhecer',
    slot: 'title',
    rarity: 'raro',
    description: 'Para quem treina antes de o mundo acordar.',
    price: 240,
    value: 'Lâmina do Amanhecer',
  },
  {
    id: 'titulo-guardiao-descanso',
    name: 'Guardião do Descanso',
    slot: 'title',
    rarity: 'raro',
    description: 'Sabe que a recuperação também é treino.',
    price: 240,
    value: 'Guardião do Descanso',
  },
  {
    id: 'titulo-lenda',
    name: 'Lenda em Ascensão',
    slot: 'title',
    rarity: 'epico',
    description: 'O nome que aparece nas histórias que se contam no ginásio.',
    price: 520,
    value: 'Lenda em Ascensão',
  },

  // Auras
  {
    id: 'aura-ciano',
    name: 'Aura Ciano',
    slot: 'aura',
    rarity: 'comum',
    description: 'Brilho elétrico e sereno.',
    price: 140,
    value: '#22d3ee',
  },
  {
    id: 'aura-violeta',
    name: 'Aura Violeta',
    slot: 'aura',
    rarity: 'raro',
    description: 'Energia profunda de fim de tarde.',
    price: 280,
    value: '#a855f7',
  },
  {
    id: 'aura-dourada',
    name: 'Aura Dourada',
    slot: 'aura',
    rarity: 'epico',
    description: 'A luz de quem já provou muito a si próprio.',
    price: 500,
    value: '#fbbf24',
  },
]

export const COSMETIC_BY_ID: Record<string, CosmeticItem> = Object.fromEntries(
  COSMETICS.map((item) => [item.id, item]),
)

export function getCosmetic(id: string): CosmeticItem | undefined {
  return COSMETIC_BY_ID[id]
}

export const SLOT_LABELS: Record<CosmeticSlot, string> = {
  frame: 'Molduras',
  title: 'Títulos',
  aura: 'Auras',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum',
  raro: 'Raro',
  epico: 'Épico',
}

export const RARITY_CLASSES: Record<Rarity, string> = {
  comum: 'text-ink-muted border-night-600',
  raro: 'text-cyan-soft border-cyan-electric/45',
  epico: 'text-gold-soft border-gold/50',
}

/** Pool usada nas recompensas aleatórias pós-treino (apenas comuns e raros). */
export const BONUS_REWARD_POOL = COSMETICS.filter((item) => item.rarity !== 'epico').map((item) => item.id)
