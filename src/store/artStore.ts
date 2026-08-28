import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_PREFIX, createPersistStorage } from '@/services/storage'
import { ART_SLOTS, findStaticArt } from '@/services/userArt'
import type { ArtSlot } from '@/services/userArt'

interface ArtStore {
  /** Imagens carregadas pelo utilizador, em data URL. */
  uploaded: Partial<Record<ArtSlot, string>>
  /** Escurecimento aplicado por cima dos fundos, para o texto continuar legível. */
  scrim: number
  setArt: (slot: ArtSlot, dataUrl: string) => void
  clearArt: (slot: ArtSlot) => void
  setScrim: (value: number) => void
}

/**
 * Véu de contraste por omissão.
 *
 * Medido no simulador com uma fotografia de céu quase branco (o pior caso:
 * o pixel mais claro que uma imagem pode ter). O que sai do véu é o chão de
 * todo o texto que não está dentro de um cartão — os rótulos de secção, o
 * cabeçalho do ecrã. Contra esse branco:
 *
 * | véu  | pixel | ink   | ink-muted | ember-soft |
 * |------|-------|-------|-----------|------------|
 * | 0,62 |  100  |  5,33 |    2,39   |    2,92    |  ← antigo, reprova
 * | 0,78 |   60  |  9,93 |    4,46   |    5,44    |  ← AA para tudo menos ink-faint
 *
 * 0,78 é o ponto em que `ink-muted` (10,5 px, o mais pequeno que assenta
 * direto no fundo) chega aos 4,5:1 da WCAG AA. Só `ink-faint` fica abaixo, e
 * esse vive dentro dos cartões, onde o `bg-void-800/70` o leva a 4,4:1.
 */
export const DEFAULT_SCRIM = 0.78

/** Véu da versão anterior — ver `migrateArt`. */
const LEGACY_SCRIM = 0.62

/**
 * O véu não desce abaixo disto: a 0 %, uma fotografia clara deixa o próprio
 * `ink` a 1,05:1 e o ecrã fica ilegível. Um controlo de gosto não pode ter uma
 * ponta que parte a aplicação.
 */
export const MIN_SCRIM = 0.4

/**
 * Slots da versão anterior: `start` pintava o ecrã de entrada e `dashboard` só
 * o Quartel. Deram os dois lugar ao fundo único (`app`).
 */
interface PersistedArt {
  uploaded?: Partial<Record<ArtSlot | 'start' | 'dashboard', string>>
  scrim?: number
}

/**
 * v0 → v1: passa a haver um fundo só para os cinco ecrãs de dentro da app.
 *
 * Quem já tinha imagens não as perde: a do Quartel (`dashboard`) é a que
 * herda o fundo, porque era a única que se via depois de haver perfil; a do
 * ecrã de entrada (`start`) só entra se não houver nenhuma no Quartel. As
 * chaves antigas não ficam para trás — cada uma pesava até 1,4 MB de data URL
 * e a quota do `localStorage` anda pelos 5 MB.
 *
 * O véu sobe ao mesmo tempo, mas só para quem nunca lhe tocou: a imagem
 * passou de um ecrã para cinco e o valor antigo já não chegava (ver
 * `DEFAULT_SCRIM`). Quem escolheu um valor à mão fica com ele, apenas preso ao
 * mínimo novo.
 */
function migrateArt(persisted: unknown): Pick<ArtStore, 'uploaded' | 'scrim'> {
  const previous = (persisted ?? {}) as PersistedArt
  const legacy = previous.uploaded ?? {}
  const background = legacy.app ?? legacy.dashboard ?? legacy.start

  const uploaded: Partial<Record<ArtSlot, string>> = {}
  if (background) uploaded.app = background
  if (legacy.avatar) uploaded.avatar = legacy.avatar

  const stored = previous.scrim
  const scrim =
    typeof stored !== 'number' || stored === LEGACY_SCRIM
      ? DEFAULT_SCRIM
      : Math.min(0.9, Math.max(MIN_SCRIM, stored))

  return { uploaded, scrim }
}

export const useArtStore = create<ArtStore>()(
  persist(
    (set) => ({
      uploaded: {},
      scrim: DEFAULT_SCRIM,
      setArt: (slot, dataUrl) => set((state) => ({ uploaded: { ...state.uploaded, [slot]: dataUrl } })),
      clearArt: (slot) =>
        set((state) => {
          const uploaded = { ...state.uploaded }
          delete uploaded[slot]
          return { uploaded }
        }),
      setScrim: (value) => set({ scrim: Math.min(0.9, Math.max(MIN_SCRIM, value)) }),
    }),
    { name: 'art', storage: createPersistStorage(), version: 1, migrate: migrateArt },
  ),
)

/**
 * `true` quando a imagem do slot ficou mesmo gravada no armazenamento local.
 *
 * O adaptador de armazenamento apanha o erro de quota e escreve numa memória
 * volátil, de propósito, para a app não rebentar — mas isso torna a falha
 * invisível: a imagem aparece e desaparece no arranque seguinte. Esta função lê
 * o `localStorage` sem passar pela memória volátil, que é a única forma de
 * saber se a escrita foi mesmo para o disco.
 */
export function artPersisted(slot: ArtSlot): boolean {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}art`)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { state?: { uploaded?: Partial<Record<ArtSlot, string>> } }
    return Boolean(parsed.state?.uploaded?.[slot])
  } catch {
    return false
  }
}

/** Ficheiros encontrados em `public/assets/`, procurados uma vez por sessão. */
const staticCache = new Map<ArtSlot, string | null>()
let staticScanned = false

async function scanStaticArt(): Promise<void> {
  if (staticScanned) return
  staticScanned = true
  await Promise.all(
    ART_SLOTS.map(async (slot) => {
      staticCache.set(slot, await findStaticArt(slot))
    }),
  )
}

/**
 * Imagem ativa para um slot: a carregada na app tem precedência sobre o
 * ficheiro estático. Devolve null quando não há nenhuma e a app usa as suas
 * próprias ilustrações.
 */
export function useArt(slot: ArtSlot): string | null {
  const uploaded = useArtStore((state) => state.uploaded[slot])
  const [staticArt, setStaticArt] = useState<string | null>(() => staticCache.get(slot) ?? null)

  useEffect(() => {
    if (uploaded) return
    let cancelled = false
    void scanStaticArt().then(() => {
      if (!cancelled) setStaticArt(staticCache.get(slot) ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [slot, uploaded])

  return uploaded ?? staticArt
}
