import { HollowMask } from '@/components/art/HollowMask'
import { SpiritMotes } from '@/components/art/SpiritArt'
import { getCosmetic } from '@/data/cosmetics'
import { useI18n } from '@/i18n'
import { levelFromXp, maskStageForLevel, titleKeyForLevel } from '@/services/calculations'
import { formatDuration } from '@/services/dates'
import { useGameStore } from '@/store/gameStore'
import type { SessionResult } from '@/store/workoutStore'

interface CelebrationScreenProps {
  result: SessionResult
  onClose: () => void
}

/**
 * Os selos guardam uma cor ou um gradiente em `value` e é isso que a bola do
 * cartão mostra. Os títulos guardam a palavra `title`, que não é pintável — aí
 * fica o gradiente da casa.
 */
function cosmeticSwatch(value: string): string {
  return value.startsWith('#') || value.startsWith('linear-gradient')
    ? value
    : 'linear-gradient(135deg, #ff8a14, #d1244a)'
}

/**
 * Fim de sessão em ecrã inteiro, com a máscara ao centro.
 *
 * Era um painel modal sobre o ecrã anterior. O protótipo de design fixou a
 * direção contrária — a máscara é o momento, e um cartão de 32 rem com o treino
 * a espreitar por trás roubava-lhe a escala. Aqui não há tab bar nem fundo: só
 * o preto da celebração, a coroa de raios e o osso.
 *
 * O que a app mostrava em cinco blocos (duração, séries, reiatsu, barra de
 * patente, atributos) passa a uma linha de contexto e três colunas. A barra de
 * progresso saiu: a patente já está escrita por extenso a seguir à máscara.
 */
export function CelebrationScreen({ result, onClose }: CelebrationScreenProps) {
  const { t, n, loc } = useI18n()
  const xp = useGameStore((state) => state.xp)
  const info = levelFromXp(xp)

  const { log } = result
  const cosmetic = result.bonusRewardId ? getCosmetic(result.bonusRewardId) : undefined
  const leveledUp = result.levelAfter > result.levelBefore
  const level = leveledUp ? result.levelAfter : info.level

  const { forca, resistencia, disciplina } = result.attributes
  const arts = forca + resistencia + disciplina

  /*
   * Inteira, em qualquer patente. Na ficha a máscara segue a regra do posto e
   * abaixo da décima nem chega a existir; aqui não é o rosto do utilizador — é
   * o emblema da aplicação, o mesmo do ícone e do favicon. Translúcida deixava
   * passar o halo carmim que tem por baixo, em vez de assentar sobre ele.
   */
  const stage = maskStageForLevel(level) ?? 'plena'

  return (
    <div className="animate-pop fixed inset-0 z-50 flex justify-center bg-void-950">
      {/*
        A decoração vive dentro da coluna, não do ecrã. Num telemóvel de 402 px
        a coroa de 470 px sai pelos lados e vê-se só a faixa do meio, que é o
        desenho pretendido; solta no ecrã de um portátil abria-se como uma
        estrela inteira por trás do texto.
      */}
      <div className="relative flex w-full max-w-[440px] flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[300px] -ml-[235px] -mt-[235px] size-[470px] opacity-[0.42]"
          aria-hidden="true"
          style={{
            background:
              'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,138,20,.6) 0deg 0.6deg, transparent 0.6deg 3.4deg)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 50%, transparent 86px, rgba(0,0,0,.85) 132px, transparent 220px)',
            maskImage: 'radial-gradient(circle at 50% 50%, transparent 86px, rgba(0,0,0,.85) 132px, transparent 220px)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(34rem 26rem at 50% 30%, rgba(200,16,46,.42), transparent 62%)' }}
        />
        <SpiritMotes tone="ember" count={3} />

        {/*
          O protótipo cabe nos 874 px do iPhone 16 Pro e não precisa de scroll.
          Num SE de 667 px o cartão de recompensa caía fora do ecrã, por isso o
          corpo rola — o rodapé com o botão fica fixo em baixo.
        */}
        <div className="relative flex flex-1 flex-col items-center overflow-y-auto overscroll-contain px-[22px] pt-[max(44px,calc(0.5rem+env(safe-area-inset-top)))] text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] text-ember-soft">
            {leveledUp ? t.celebration.rankUpLabel : t.celebration.doneLabel}
          </p>

          <div className="relative mt-[22px] flex size-[176px] shrink-0 items-center justify-center">
            {/* Poeira de reiatsu suspensa à volta do osso. */}
            <div
              className="pointer-events-none absolute -inset-4 rounded-full opacity-[0.55]"
              aria-hidden="true"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,138,20,.95) 1px, transparent 1.4px)',
                backgroundSize: '6px 6px',
                WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,.9) 42%, transparent 74%)',
                maskImage: 'radial-gradient(circle, rgba(0,0,0,.9) 42%, transparent 74%)',
              }}
            />
            <HollowMask
              size={168}
              stage={stage}
              className="relative [filter:drop-shadow(7px_7px_0_rgba(200,16,46,0.6))]"
            />
          </div>

          <p className="mt-5 text-[11px] font-semibold tracking-[0.2em] text-ink-muted">
            {t.dashboard.rankLabel(String(level).padStart(2, '0'))}
          </p>
          <h1 className="mt-1.5 font-display text-[44px] font-bold leading-none text-ink [text-shadow:5px_5px_0_rgba(200,16,46,0.6)]">
            {t.levelTitles[titleKeyForLevel(level)]}
          </h1>
          <p className="mt-3 max-w-[31ch] text-[13px] leading-[1.6] text-pretty text-ink-muted">
            {leveledUp ? t.celebration.rankUpLine : t.celebration.doneLine}
          </p>
          <p className="mt-2.5 font-display text-sm font-semibold tracking-[0.06em] text-good">
            {t.celebration.setsInTime(log.completedSets, log.totalSets, formatDuration(log.durationSeconds))}
          </p>

          <div className="mt-5 flex w-full border-y border-void-700">
            <div className="flex-1 border-r border-void-700 py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-muted">{t.celebration.reiatsu}</p>
              <p className="mt-1 font-mono text-[25px] font-bold leading-none tabular-nums text-ember-soft">
                +{n(log.xpEarned)}
              </p>
            </div>
            <div className="flex-1 border-r border-void-700 py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-muted">{t.celebration.kanLabel}</p>
              <p className="mt-1 font-mono text-[25px] font-bold leading-none tabular-nums text-gold-soft">
                +{n(log.coinsEarned)}
              </p>
            </div>
            <div className="flex-1 py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-muted">{t.celebration.arts}</p>
              <p className="mt-1 font-mono text-[25px] font-bold leading-none tabular-nums text-spirit">+{arts}</p>
            </div>
          </div>

          {cosmetic && (
            // Cantos cortados a 18 px, como o cartão de recompensa do protótipo.
            <div
              className="mt-4 flex w-full items-center gap-[13px] border border-crimson-soft/55 p-[15px] text-left [clip-path:polygon(18px_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%,0_18px)]"
              style={{ background: 'linear-gradient(140deg, rgba(239,74,99,.15), rgba(22,22,31,.9))' }}
            >
              <span
                className="size-8 shrink-0 rounded-full shadow-[0_0_18px_rgba(255,138,20,.65)]"
                style={{ background: cosmeticSwatch(cosmetic.value) }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-bold text-ink">{loc(cosmetic.name)}</p>
                <p className="mt-px text-[11px] text-ink-muted">
                  {t.celebration.cosmeticUnlocked(t.cosmeticSlotNames[cosmetic.slot])}
                </p>
              </div>
              <span className="shrink-0 bg-crimson-soft/20 px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.06em] text-ember-soft">
                {t.rarities[cosmetic.rarity]}
              </span>
            </div>
          )}
        </div>

        <div className="relative px-[22px] pt-[18px] pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            // `void-950` sobre o extremo carmim do gradiente, como no CTA do Quartel.
            className="h-14 w-full chamfer-lg bg-ember font-display text-[18px] font-bold tracking-[0.05em] text-void-950 transition-opacity active:opacity-90"
          >
            {t.celebration.backToBase}
          </button>
        </div>
      </div>
    </div>
  )
}
