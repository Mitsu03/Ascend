import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { useToastStore } from '@/store/toastStore'
import type { ToastKind } from '@/store/toastStore'

const KIND_STYLES: Record<ToastKind, { border: string; icon: string }> = {
  info: { border: 'border-void-500', icon: 'text-spirit' },
  sucesso: { border: 'border-good/45', icon: 'text-good' },
  nivel: { border: 'border-gold/60 glow-gold', icon: 'text-gold' },
  conquista: { border: 'border-crimson-soft/50 glow-crimson', icon: 'text-crimson-soft' },
  aviso: { border: 'border-warn/45', icon: 'text-warn' },
}

const DEFAULT_ICON: Record<ToastKind, string> = {
  info: 'Info',
  sucesso: 'CheckCircle2',
  nivel: 'Sparkles',
  conquista: 'Trophy',
  aviso: 'AlertTriangle',
}

export function Toaster() {
  const { t } = useI18n()
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div
      /*
       * Os avisos pousam 8 px acima da barra de separadores, seja qual for a
       * altura dela. Com um valor escrito à mão apareciam por baixo da barra em
       * telefones com indicador de início e, depois de a barra encolher,
       * ficariam a flutuar longe dela.
       */
      className="pointer-events-none fixed right-4 bottom-[calc(var(--tab-bar)+0.5rem)] z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 md:bottom-6"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const style = KIND_STYLES[toast.kind]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex animate-rise items-start gap-3 chamfer-md border bg-void-800/95 p-3.5 shadow-xl backdrop-blur',
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
              aria-label={t.common.dismissNotification}
              className="tap-target -m-1 flex size-8 shrink-0 items-center justify-center chamfer-xs text-ink-muted transition-colors hover:text-ink"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
