import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from '@/services/storage'
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

export const DEFAULT_SCRIM = 0.62

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
      setScrim: (value) => set({ scrim: Math.min(0.9, Math.max(0, value)) }),
    }),
    { name: 'art', storage: createPersistStorage() },
  ),
)

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
