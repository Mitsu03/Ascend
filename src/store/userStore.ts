import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { computeTargets } from '@/services/calculations'
import { createPersistStorage } from '@/services/storage'
import type { MacroTargets, UserProfile } from '@/types'

interface UserStore {
  profile: UserProfile | null
  targets: MacroTargets | null
  /** true quando os dados vieram do perfil de demonstração */
  isDemo: boolean
  setProfile: (profile: UserProfile, options?: { isDemo?: boolean }) => void
  updateProfile: (patch: Partial<UserProfile>) => void
  setAvatar: (variant: number, hue: number) => void
  reset: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      targets: null,
      isDemo: false,

      setProfile: (profile, options) =>
        set({ profile, targets: computeTargets(profile), isDemo: options?.isDemo ?? false }),

      updateProfile: (patch) => {
        const current = get().profile
        if (!current) return
        const profile = { ...current, ...patch }
        set({ profile, targets: computeTargets(profile) })
      },

      setAvatar: (avatarVariant, avatarHue) => {
        const current = get().profile
        if (!current) return
        set({ profile: { ...current, avatarVariant, avatarHue } })
      },

      reset: () => set({ profile: null, targets: null, isDemo: false }),
    }),
    { name: 'user', storage: createPersistStorage() },
  ),
)
