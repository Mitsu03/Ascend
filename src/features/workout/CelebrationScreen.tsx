import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCosmetic } from '@/data/cosmetics'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { ProgressBar } from '@/components/ui/Progress'
import { formatNumber } from '@/lib/cn'
import { levelFromXp } from '@/services/calculations'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-night-950/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg animate-pop space-y-5 rounded-3xl border border-gold/40 bg-night-850 p-6 shadow-2xl glow-gold">
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <Icon name={perfect ? 'Trophy' : 'PartyPopper'} size={32} />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">Treino concluído</h1>
          <p className="mt-1 text-sm text-ink-muted">{workoutDoneLine(log.completedSets)}</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-xl border border-night-600 bg-night-900/50 p-3">
            <p className="text-[11px] font-medium text-ink-muted">Duração</p>
            <p className="font-display text-xl font-bold tabular-nums text-ink">
              {formatDuration(log.durationSeconds)}
            </p>
          </div>
          <div className="rounded-xl border border-night-600 bg-night-900/50 p-3">
            <p className="text-[11px] font-medium text-ink-muted">Séries</p>
            <p className="font-display text-xl font-bold tabular-nums text-ink">
              {log.completedSets}/{log.totalSets}
            </p>
          </div>
          <div className="rounded-xl border border-night-600 bg-night-900/50 p-3">
            <p className="text-[11px] font-medium text-ink-muted">Moedas</p>
            <p className="font-display text-xl font-bold tabular-nums text-gold">+{log.coinsEarned}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-electric/30 bg-cyan-electric/5 p-5 text-center">
          <p className="font-display text-5xl font-bold text-gold">+{formatNumber(log.xpEarned)}</p>
          <p className="text-sm font-medium text-ink-muted">XP ganho</p>
          {perfect && (
            <Badge tone="good" icon="CheckCircle2" className="mt-2">
              Todas as séries concluídas · bónus incluído
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">
              Nível {info.level}
              {leveledUp && <span className="ml-2 text-gold">Subiste de nível!</span>}
            </span>
            <span className="tabular-nums text-ink-faint">
              {formatNumber(info.currentLevelXp)} / {formatNumber(info.nextLevelXp)} XP
            </span>
          </div>
          <ProgressBar value={barValue} max={info.nextLevelXp} tone="xp" height="lg" showShimmer label="Progresso de nível" />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge tone="cyan" icon="Zap">Força +{result.attributes.forca}</Badge>
          <Badge tone="cyan" icon="Activity">Resistência +{result.attributes.resistencia}</Badge>
          {result.attributes.disciplina > 0 && (
            <Badge tone="violet" icon="Brain">Disciplina +{result.attributes.disciplina}</Badge>
          )}
        </div>

        {cosmetic ? (
          <div className="flex items-center gap-3 rounded-xl border border-violet-soft/45 bg-violet-deep/10 p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-deep/30 text-violet-soft">
              <Icon name="Gift" size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Recompensa surpresa: {cosmetic.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{cosmetic.description}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-ink-faint">
            Sem recompensa cosmética desta vez — recebeste 15 moedas extra em compensação.
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="primary" size="lg" fullWidth icon="Home" onClick={onClose}>
            Voltar à Base
          </Button>
          <Button
            size="lg"
            icon="User"
            onClick={() => {
              onClose()
              navigate('/perfil')
            }}
          >
            Perfil
          </Button>
        </div>
      </div>
    </div>
  )
}
