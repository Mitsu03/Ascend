import { ART_ICONS } from '@/data/artIcons'
import { cn } from '@/lib/cn'
import type { ArtIconName } from '@/data/artIcons'

/**
 * Ícone ilustrativo do conjunto game-icons.net (CC BY 3.0 — ver
 * `public/art/LICENSE.md`). Ao contrário dos ícones de interface do lucide,
 * estes são peças decorativas: silhuetas densas para emblemas, marcas de água
 * e ornamentos de fundo.
 *
 * O traçado herda `currentColor`, por isso a cor define-se com `className`.
 */
interface ArtIconProps {
  name: ArtIconName
  size?: number
  className?: string
  /** Marca decorativa — fica fora da árvore de acessibilidade. */
  decorative?: boolean
  title?: string
  style?: React.CSSProperties
}

export function ArtIcon({ name, size = 24, className, decorative = true, title, style }: ArtIconProps) {
  const path = ART_ICONS[name]
  if (!path) return null

  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      style={style}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : title}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  )
}
