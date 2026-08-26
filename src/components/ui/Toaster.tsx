import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { useToastStore } from '@/store/toastStore'
import type { ToastKind } from '@/store/toastStore'

const KIND_STYLES: Record<ToastKind, { border: string; icon: string; text: string }> = {
  info: { border: 'border-night-500', icon: 'text-cyan-electric', text: 'Info' },
  sucesso: { border: 'border-good/45', icon: 'text-good', text: 'Sucesso' },
  nivel: { border: 'border-gold/60 glow-gold', icon: 'text-gold', text: 'Novo nível' },
  conquista: { border: 'border-violet-soft/50 glow-violet', icon: 'text-violet-soft', text: 'Conquista' },
  aviso: { border: 'border-warn/45', icon: 'text-warn', text: 'Aviso' },
}

const DEFAULT_ICON: Record<ToastKind, string> = {
  info: 'Info',
  sucesso: 'CheckCircle2',
  nivel: 'Sparkles',
  conquista: 'Trophy',
  aviso: 'AlertTriangle',
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-24 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 md:bottom-6"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const style = KIND_STYLES[toast.kind]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex animate-rise items-start gap-3 rounded-xl border bg-night-800/95 p-3.5 shadow-xl backdrop-blur',
              style.border,
            )}
          >
            <span className={cn('mt-0.5 shrink-0', style.icon)}>
              <Icon name={toast.icon ?? DEFAULT_ICON[toast.kind]} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{toast.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar notificação"
              className="shrink-0 rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
