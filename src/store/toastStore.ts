import { create } from 'zustand'

export type ToastKind = 'info' | 'sucesso' | 'nivel' | 'conquista' | 'aviso'

export interface Toast {
  id: string
  kind: ToastKind
  title: string
  description?: string
  icon?: string
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

let counter = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    counter += 1
    const id = `toast-${counter}`
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
    }, 5200)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}))

export const toast = (payload: Omit<Toast, 'id'>) => useToastStore.getState().push(payload)
