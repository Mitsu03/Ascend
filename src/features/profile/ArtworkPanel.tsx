import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { ART_SLOTS, ArtTooLargeError, prepareArt } from '@/services/userArt'
import { DEFAULT_SCRIM, MIN_SCRIM, artPersisted, useArt, useArtStore } from '@/store/artStore'
import type { ArtSlot } from '@/services/userArt'

function SlotRow({ slot }: { slot: ArtSlot }) {
  const { t } = useI18n()
  const uploaded = useArtStore((state) => state.uploaded[slot])
  const setArt = useArtStore((state) => state.setArt)
  const clearArt = useArtStore((state) => state.clearArt)
  const active = useArt(slot)
  const [error, setError] = useState<string | null>(null)

  const labels: Record<ArtSlot, string> = {
    app: t.artwork.slotApp,
    avatar: t.artwork.slotAvatar,
  }

  const hints: Record<ArtSlot, string> = {
    app: t.artwork.slotAppHint,
    avatar: t.artwork.slotAvatarHint,
  }

  const pick = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    try {
      setArt(slot, await prepareArt(file, slot))
      // A imagem já está aplicada, mas pode não ter cabido no disco — nesse
      // caso desaparece no arranque seguinte, e o utilizador tem de saber.
      if (!artPersisted(slot)) setError(t.artwork.notSaved)
    } catch (cause) {
      setError(cause instanceof ArtTooLargeError ? t.artwork.tooLarge : t.artwork.unreadable)
    }
  }

  return (
    <li className="rounded-xl border border-void-600 bg-void-800/40 p-3.5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-void-600 bg-void-900',
            slot === 'avatar' && 'rounded-full',
          )}
        >
          {active ? (
            <img src={active} alt="" className="size-full object-cover" />
          ) : (
            <Icon name="Image" size={20} className="text-ink-faint" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{labels[slot]}</p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {!active ? t.artwork.empty : uploaded ? t.artwork.replace : t.artwork.fromFolder}
          </p>
          {error && <p className="mt-1 text-xs text-bad">{error}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label className="tap-target inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-void-500 bg-void-700/60 px-3 text-sm text-ink transition-colors hover:bg-void-700 active:opacity-90">
            <Icon name="Image" size={15} />
            {uploaded ? t.artwork.replace : t.artwork.choose}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => void pick(event.target.files?.[0])}
            />
          </label>
          {uploaded && (
            <Button size="sm" variant="ghost" icon="Trash2" onClick={() => clearArt(slot)}>
              {t.artwork.remove}
            </Button>
          )}
        </div>
      </div>

      {/* Onde é que a imagem aparece. Vai por baixo da linha, à largura toda:
          espremido entre a miniatura e o botão sobrava-lhe um terço do ecrã e
          partia-se em quatro linhas. */}
      <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">{hints[slot]}</p>
    </li>
  )
}

/**
 * `bare` rende só o conteúdo, sem a moldura de cartão nem o cabeçalho: é a
 * forma usada quando o painel abre dentro de uma folha, que já traz título e
 * descrição próprios. Sem isto o título aparecia duas vezes.
 */
export function ArtworkPanel({ bare = false }: { bare?: boolean }) {
  const { t } = useI18n()
  const scrim = useArtStore((state) => state.scrim)
  const setScrim = useArtStore((state) => state.setScrim)

  const content = (
    <div className="space-y-4">
        <ul className="space-y-2">
          {ART_SLOTS.map((slot) => (
            <SlotRow key={slot} slot={slot} />
          ))}
        </ul>

        <div className="space-y-1.5">
          <label htmlFor="art-scrim" className="block text-sm font-medium text-ink-muted">
            {t.artwork.scrimLabel}
          </label>
          <input
            id="art-scrim"
            type="range"
            min={MIN_SCRIM * 100}
            max={90}
            step={5}
            value={Math.round(scrim * 100)}
            onChange={(event) => setScrim(Number(event.target.value) / 100)}
            // Um cursor de 20 px de altura é difícil de agarrar com o polegar;
            // a caixa passa a 44 pt e o traço fica centrado nela.
            className="h-11 w-full accent-ember"
          />
          <p className="text-xs text-ink-faint">{t.artwork.scrimHint}</p>
        </div>

        <p className="flex items-start gap-2 rounded-xl border border-void-600 bg-void-900/50 p-3 text-xs leading-relaxed text-ink-faint">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          {t.artwork.note}
        </p>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
        <Icon name="Scale" size={14} className="mt-0.5 shrink-0" />
        {t.artwork.licenceNote}
      </p>
    </div>
  )

  if (bare) return content

  return (
    <Card>
      <CardHeader
        title={t.artwork.title}
        subtitle={t.artwork.subtitle}
        icon="Image"
        action={
          scrim !== DEFAULT_SCRIM ? <Badge tone="neutral">{Math.round(scrim * 100)}%</Badge> : undefined
        }
      />
      <CardBody className="pt-3">{content}</CardBody>
    </Card>
  )
}
