import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/components/ui/Button'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' } as const

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const { t } = useI18n()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  /*
   * `onClose` chega quase sempre como função anónima («onClose={() => setX(null)}»),
   * por isso muda de identidade a cada render do componente que abre a folha.
   * Com ela nas dependências, o efeito voltava a correr a cada tecla escrita
   * num campo do formulário de perfil — e a chamada a `focus()` no painel tirava
   * o foco ao campo e fechava o teclado do iOS a meio da palavra. Guardada numa
   * ref, o efeito passa a depender só de `open`.
   */
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    // Quem tinha o foco antes de a folha abrir fica guardado para lho devolver
    // ao fechar; sem isto o foco voltava ao princípio do documento e quem
    // navega por teclado ou por VoiceOver perdia o sítio onde estava.
    const previouslyFocused = document.activeElement as HTMLElement | null

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      // Prende o Tab dentro da folha: um diálogo modal não deve deixar chegar
      // ao conteúdo que está por baixo.
      if (event.key !== 'Tab' || !panel) return
      const targets = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (targets.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = targets[0]
      const last = targets[targets.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    // O scroll da app está no elemento raiz, não no `body`: travar só o `body`
    // deixava a página continuar a correr por trás da folha na WKWebView.
    const previousBodyOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    panel?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousRootOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-void-950/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col chamfer-lg border border-void-600 bg-void-850 shadow-2xl sm:chamfer-lg',
          'animate-rise',
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-void-700 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton icon="X" label={t.common.close} onClick={onClose} size="sm" />
        </div>
        <div
          className={cn(
            // `overscroll-contain`: chegado ao fim da lista, o arrasto ficava a
            // puxar a página que está por baixo da folha.
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4',
            // Em folha inferior, o último elemento encostaria ao indicador de
            // início do iPhone, onde o sistema come os toques. Só quando não há
            // rodapé — havendo, é o rodapé que leva a margem.
            !footer && 'max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))]',
          )}
        >
          {children}
        </div>
        {footer && (
          <div className="border-t border-void-700 px-5 py-4 max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n()
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>{cancelLabel ?? t.common.cancel}</Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel ?? t.common.confirm}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-ink-muted">{message}</p>
    </Modal>
  )
}
