import { localized as l } from '@/i18n/types'
import type { CosmeticItem, CosmeticSlot, Rarity } from '@/types'

/**
 * Cosméticos puramente estéticos. As moedas do MVP servem apenas para isto —
 * não existe qualquer vantagem de jogo associada.
 */
export const COSMETICS: CosmeticItem[] = [
  // Molduras do avatar
  {
    id: 'moldura-ferro',
    name: l('Moldura de Aço', 'Steel Frame'),
    slot: 'frame',
    rarity: 'comum',
    description: l(
      'Um contorno sóbrio para quem começou a levar a sério.',
      'A restrained outline for someone starting to take this seriously.',
    ),
    price: 120,
    value: '#7b8494',
  },
  {
    id: 'moldura-aurora',
    name: l('Moldura Aurora', 'Dawn Frame'),
    slot: 'frame',
    rarity: 'raro',
    description: l(
      'Gradiente âmbar e carmesim, como o céu antes do treino da manhã.',
      'An amber and crimson gradient, like the sky before a morning session.',
    ),
    price: 260,
    value: 'linear-gradient(135deg, #ff7a1a, #d1244a)',
  },
  {
    id: 'moldura-solar',
    name: l('Moldura Solar', 'Solar Frame'),
    slot: 'frame',
    rarity: 'epico',
    description: l('Ouro fundido. Reservada a quem não falha.', 'Molten gold. Reserved for those who never miss.'),
    price: 480,
    value: 'linear-gradient(135deg, #ffb020, #ff5a1f)',
  },

  // Títulos
  {
    id: 'titulo-novato',
    name: l('Alma Determinada', 'Determined Soul'),
    slot: 'title',
    rarity: 'comum',
    description: l('Todo o herói começa aqui.', 'Every hero starts here.'),
    price: 80,
    value: 'title',
  },
  {
    id: 'titulo-lamina',
    name: l('Lâmina do Amanhecer', 'Blade of Dawn'),
    slot: 'title',
    rarity: 'raro',
    description: l(
      'Para quem treina antes de o mundo acordar.',
      'For those who train before the world wakes up.',
    ),
    price: 240,
    value: 'title',
  },
  {
    id: 'titulo-guardiao-descanso',
    name: l('Guardião do Descanso', 'Guardian of Rest'),
    slot: 'title',
    rarity: 'raro',
    description: l(
      'Sabe que a recuperação também é treino.',
      'Knows that recovery is training too.',
    ),
    price: 240,
    value: 'title',
  },
  {
    id: 'titulo-lenda',
    name: l('Lenda em Ascensão', 'Rising Legend'),
    slot: 'title',
    rarity: 'epico',
    description: l(
      'O nome que aparece nas histórias que se contam no ginásio.',
      'The name that shows up in the stories people tell at the gym.',
    ),
    price: 520,
    value: 'title',
  },

  // Auras
  {
    id: 'aura-ciano',
    name: l('Aura Espectral', 'Spectral Aura'),
    slot: 'aura',
    rarity: 'comum',
    description: l('Brilho branco-azulado e sereno.', 'A calm blue-white glow.'),
    price: 140,
    value: '#8fd4ff',
  },
  {
    id: 'aura-carmesim',
    name: l('Aura Carmesim', 'Crimson Aura'),
    slot: 'aura',
    rarity: 'raro',
    description: l('Energia profunda de fim de tarde.', 'Deep late-afternoon energy.'),
    price: 280,
    value: '#e0325c',
  },
  {
    id: 'aura-dourada',
    name: l('Aura Incandescente', 'Blazing Aura'),
    slot: 'aura',
    rarity: 'epico',
    description: l(
      'A luz de quem já provou muito a si próprio.',
      'The light of someone who has proved plenty to themselves.',
    ),
    price: 500,
    value: '#ff7a1a',
  },
]

export const COSMETIC_BY_ID: Record<string, CosmeticItem> = Object.fromEntries(
  COSMETICS.map((item) => [item.id, item]),
)

export function getCosmetic(id: string): CosmeticItem | undefined {
  return COSMETIC_BY_ID[id]
}

export const SLOT_ORDER: CosmeticSlot[] = ['frame', 'title', 'aura']

export const RARITY_CLASSES: Record<Rarity, string> = {
  comum: 'text-ink-muted border-void-600',
  raro: 'text-spirit border-ember/45',
  epico: 'text-gold-soft border-gold/50',
}

/** Pool usada nas recompensas aleatórias pós-treino (apenas comuns e raros). */
export const BONUS_REWARD_POOL = COSMETICS.filter((item) => item.rarity !== 'epico').map((item) => item.id)
