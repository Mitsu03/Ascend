import { localized as l } from '@/i18n/types'
import type { CosmeticItem, CosmeticSlot, Rarity } from '@/types'

/**
 * Cosméticos puramente estéticos. O kan do MVP serve apenas para isto — não
 * existe qualquer vantagem de jogo associada.
 *
 * Os três escalões seguem a escala de evolução dos Hollow: `comum` é um
 * Hollow, `raro` um Adjuchas e `epico` um Vasto Lorde.
 */
export const COSMETICS: CosmeticItem[] = [
  // Selos — o anel à volta do retrato, ao jeito do distintivo da divisão
  {
    id: 'selo-asauchi',
    name: l('Selo Asauchi', 'Asauchi Seal'),
    slot: 'frame',
    rarity: 'comum',
    description: l(
      'Aço por nomear, igual para todos os recrutas. Ainda assim, já é uma lâmina.',
      'Unnamed steel, the same for every recruit. Still a blade.',
    ),
    price: 120,
    value: '#7b8494',
  },
  {
    id: 'selo-shikai',
    name: l('Selo Shikai', 'Shikai Seal'),
    slot: 'frame',
    rarity: 'raro',
    description: l(
      'Âmbar e carmesim: a lâmina respondeu quando lhe chamaste pelo nome.',
      'Amber and crimson: the blade answered when you called its name.',
    ),
    price: 260,
    value: 'linear-gradient(135deg, #ff8a14, #d1244a)',
  },
  {
    id: 'selo-bankai',
    name: l('Selo Bankai', 'Bankai Seal'),
    slot: 'frame',
    rarity: 'epico',
    description: l(
      'Ouro fundido. Dez mil vezes o poder — e dez anos a merecê-lo.',
      'Molten gold. Ten thousand times the power — and ten years earning it.',
    ),
    price: 480,
    value: 'linear-gradient(135deg, #f0cf6e, #ff5a1f)',
  },

  // Títulos
  {
    id: 'titulo-rukongai',
    name: l('Alma Determinada', 'Determined Soul'),
    slot: 'title',
    rarity: 'comum',
    description: l('Todo o Shinigami saiu do Rukongai.', 'Every Soul Reaper came out of the Rukongai.'),
    price: 80,
    value: 'title',
  },
  {
    id: 'titulo-getsuga',
    name: l('Lua Cortante', 'Cutting Moon'),
    slot: 'title',
    rarity: 'raro',
    description: l(
      'Para quem treina antes de o sol nascer, com a lua ainda no céu.',
      'For those who train before sunrise, while the moon is still up.',
    ),
    price: 240,
    value: 'title',
  },
  {
    id: 'titulo-quarta',
    name: l('Guardião da Quarta', 'Guardian of the Fourth'),
    slot: 'title',
    rarity: 'raro',
    description: l(
      'Sabe que a Quarta Divisão ganha as batalhas que ninguém vê.',
      'Knows the Fourth Division wins the battles nobody sees.',
    ),
    price: 240,
    value: 'title',
  },
  {
    id: 'titulo-visored',
    name: l('Visored', 'Visored'),
    slot: 'title',
    rarity: 'epico',
    description: l(
      'Pôs a máscara e não deixou o Hollow decidir por si.',
      'Put the mask on and did not let the Hollow decide.',
    ),
    price: 520,
    value: 'title',
  },

  // Reiatsu — a cor da pressão espiritual à volta do retrato
  {
    id: 'reiatsu-espectral',
    name: l('Reiatsu Espectral', 'Spectral Reiatsu'),
    slot: 'aura',
    rarity: 'comum',
    description: l(
      'Azul-branco sereno, de quem ainda anda à procura do seu limite.',
      'A calm blue-white, still looking for its own limit.',
    ),
    price: 140,
    value: '#5cc8ff',
  },
  {
    id: 'reiatsu-carmesim',
    name: l('Reiatsu Carmesim', 'Crimson Reiatsu'),
    slot: 'aura',
    rarity: 'raro',
    description: l('Denso ao ponto de se sentir na sala ao lado.', 'Dense enough to be felt in the next room.'),
    price: 280,
    value: '#e0325c',
  },
  {
    id: 'reiatsu-getsuga',
    name: l('Reiatsu Incandescente', 'Blazing Reiatsu'),
    slot: 'aura',
    rarity: 'epico',
    description: l(
      'O laranja que fica no ar depois do corte.',
      'The orange that hangs in the air after the cut.',
    ),
    price: 500,
    value: '#ff8a14',
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
