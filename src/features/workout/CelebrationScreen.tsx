import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArtIcon } from '@/components/ArtIcon'
import { HollowMask } from '@/components/art/HollowMask'
import { getCosmetic } from '@/data/cosmetics'
import { BladeSlashes, InkWash, SpiritBurst, SpiritMotes } from '@/components/art/SpiritArt'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { ProgressBar } from '@/components/ui/Progress'
import { useI18n } from '@/i18n'
import { levelFromXp, maskStageForLevel } from '@/services/calculations'
import { formatDuration } from '@/services/dates'
import { workoutDoneLine } from '@/services/narrative'
import { useGameStore } from '@/store/gameStore'
import type { SessionResult } from '@/store/workoutStore'

interface CelebrationScreenProps {
  result: SessionResult
  onClose: () => void
}

export function CelebrationScreen({ result, onClose }: CelebrationScreenProps) {
  const navigate = useNavigate()
  const { t, n, loc } = useI18n()
  const xp = useGameStore((state) => state.xp)
  const info = levelFromXp(xp)
  const [barValue, setBarValue] = useState(0)

  // A barra arranca a zero e anima até ao valor real.
  useEffect(() => {
    const id = window.setTimeout(() => setBarValue(info.currentLevelXp), 120)
    return () => window.clearTimeout(id)
  }, [info.currentLevelXp])

  const { log } = result
  const cosmetic = result.bonusRewardId ? getCosmetic(result.bonusRewardId) : undefined
  const perfect = log.completedSets === log.totalSets
  const leveledUp = result.levelAfter > result.levelBefore

  return (
    // Ecrã inteiro e com scroll próprio: as margens seguras têm de entrar no
    // padding, senão o painel de recompensa encosta ao topo por baixo da
    // Dynamic Island e os dois botões finais caem sobre o indicador de início.
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-void-950/92 pt-[calc(1rem+env(safe-area-inset-top))] pr-[calc(1rem+env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] backdrop-blur-md">
      {/* Explosão de energia e partículas a subir por trás do painel. */}
      <div className="art-layer" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 aspect-square w-[140vmin] -translate-x-1/2 -translate-y-1/2">
          <SpiritBurst tone={perfect ? 'gold' : 'ember'} opacity={0.4} />
        </div>
      </div>
      <SpiritMotes tone="gold" />

      <div className="relative w-full max-w-lg animate-pop overflow-hidden rounded-3xl border border-gold/40 bg-void-850 p-6 shadow-2xl glow-gold">
        {/* Corte de lâmina e tinta a decorar o topo do painel. */}
        <div className="art-layer">
          <BladeSlashes tone="gold" opacity={0.22} animated />
        </div>
        <span className="pointer-events-none absolute -left-12 -top-14 size-52" aria-hidden="true">
          <InkWash tone="crimson" opacity={0.16} />
        </span>
        <div className="art-layer ink-grain" />

        <div className="relative space-y-5">
          <div className="text-center">
            {/*
              Subir de patente é o momento em que a máscara aparece; nos
              restantes treinos fica o emblema da lâmina.
            */}
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/40">
              {leveledUp ? (
                <HollowMask size={40} stage={maskStageForLevel(result.levelAfter) ?? 'nascente'} />
              ) : (
                <ArtIcon name={perfect ? 'crossed-swords' : 'quick-slash'} size={34} />
              )}
            </span>
            <h1 className="text-glow-gold mt-4 font-display text-3xl font-bold uppercase tracking-[0.1em] text-ink">
              {t.celebration.title}
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">{workoutDoneLine(log.completedSets, t)}</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-void-600 bg-void-900/50 p-3">
              <p className="text-[11px] font-medium text-ink-muted">{t.celebration.duration}</p>
              <p className="font-display text-xl font-bold tabular-nums text-ink">
                {formatDuration(log.durationSeconds)}
              </p>
            </div>
            <div className="rounded-xl border border-void-600 bg-void-900/50 p-3">
              <p className="text-[11px] font-medium text-ink-muted">{t.celebration.sets}</p>
              <p className="font-display text-xl font-bold tabular-nums text-ink">
                {log.completedSets}/{log.totalSets}
              </p>
            </div>
            <div className="rounded-xl border border-void-600 bg-void-900/50 p-3">
              <p className="text-[11px] font-medium text-ink-muted">{t.common.coins}</p>
              <p className="font-display text-xl font-bold tabular-nums text-gold">+{log.coinsEarned}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-ember/30 bg-ember/5 p-5 text-center">
            <span className="pointer-events-none absolute inset-0" aria-hidden="true">
              <SpiritMotes tone="ember" count={5} />
            </span>
            <p className="text-glow-gold relative font-display text-6xl font-bold leading-none text-gold">
              +{n(log.xpEarned)}
            </p>
            <p className="relative mt-1 text-sm font-medium uppercase tracking-[0.2em] text-ink-muted">
              {t.celebration.xpEarned}
            </p>
            {perfect && (
              <Badge tone="good" icon="CheckCircle2" className="relative mt-3">
                {t.celebration.perfect}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">
                {t.common.levelWithNumber(info.level)}
                {leveledUp && <span className="ml-2 text-gold">{t.celebration.leveledUp}</span>}
              </span>
              <span className="tabular-nums text-ink-faint">
                {t.common.xpProgress(n(info.currentLevelXp), n(info.nextLevelXp))}
              </span>
            </div>
            <ProgressBar
              value={barValue}
              max={info.nextLevelXp}
              tone="xp"
              height="lg"
              showShimmer
              label={t.common.levelProgress}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge tone="ember" icon="Zap">
              {t.attributes.forca} +{result.attributes.forca}
            </Badge>
            <Badge tone="ember" icon="Activity">
              {t.attributes.resistencia} +{result.attributes.resistencia}
            </Badge>
            {result.attributes.disciplina > 0 && (
              <Badge tone="crimson" icon="Brain">
                {t.attributes.disciplina} +{result.attributes.disciplina}
              </Badge>
            )}
          </div>

          {cosmetic ? (
            <div className="flex items-center gap-3 rounded-xl border border-crimson-soft/45 bg-crimson/10 p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-crimson/30 text-crimson-soft">
                <Icon name="Gift" size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{t.celebration.surpriseReward(loc(cosmetic.name))}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{loc(cosmetic.description)}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-ink-faint">{t.celebration.noReward}</p>
          )}

          <div className="flex gap-2">
            <Button variant="primary" size="lg" fullWidth icon="Home" onClick={onClose}>
              {t.celebration.backToBase}
            </Button>
            <Button
              size="lg"
              icon="User"
              onClick={() => {
                onClose()
                navigate('/perfil')
              }}
            >
              {t.nav.profile}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
