import { useNavigate } from 'react-router-dom'
import { ArtIcon } from '@/components/ArtIcon'
import { BladeSlashes, SpiritBurst, SpiritMotes, TwilightSky } from '@/components/art/SpiritArt'
import { HollowMask } from '@/components/art/HollowMask'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Disclaimer } from '@/components/ui/Misc'
import { HeroAvatar } from '@/components/HeroAvatar'
import { useI18n } from '@/i18n'
import { loadDemoProfile } from '@/services/session'
import { useUserStore } from '@/store/userStore'
import type { ArtIconName } from '@/data/artIcons'

export function StartPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const hasProfile = useUserStore((state) => state.profile !== null)

  const highlights: { emblem: ArtIconName; title: string; text: string }[] = [
    { emblem: 'katana', title: t.start.highlights.workoutTitle, text: t.start.highlights.workoutText },
    { emblem: 'soul-vessel', title: t.start.highlights.nutritionTitle, text: t.start.highlights.nutritionText },
    { emblem: 'hell-butterfly', title: t.start.highlights.questsTitle, text: t.start.highlights.questsText },
    { emblem: 'hollow-mask', title: t.start.highlights.progressTitle, text: t.start.highlights.progressText },
  ]

  const startDemo = () => {
    loadDemoProfile()
    navigate('/', { replace: true })
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/*
        Camadas de arte. Este ecrã fica sempre com o céu desenhado: é anterior a
        haver conta, e a imagem que as Definições deixam escolher só vale para
        os ecrãs de dentro da aplicação.
      */}
      <div className="art-layer">
        <TwilightSky />
      </div>
      <div className="art-layer">
        <BladeSlashes opacity={0.8} animated />
      </div>
      <SpiritMotes />
      <div className="art-layer ink-grain" />
      {/*
        Véu de contraste: escurece os extremos e deixa o horizonte respirar,
        com um halo suave por trás do bloco de texto para o manter legível.
      */}
      <div
        className="art-layer bg-gradient-to-b from-void-950/85 via-void-950/25 to-void-950/90"
        aria-hidden="true"
      />
      <div
        className="art-layer"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 42%, color-mix(in oklab, var(--color-void-950) 72%, transparent), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/*
        Este ecrã vive fora do `AppShell` e tem de tratar das margens seguras
        sozinho: com `py-12` fixo, o emblema ficava por baixo da Dynamic Island
        e os botões de entrada caíam sobre o indicador de início, onde o sistema
        come o toque. No browser os insets valem zero e sobram os 3 rem.
      */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-9 pt-[calc(3rem+env(safe-area-inset-top))] pr-[calc(1.25rem+env(safe-area-inset-right))] pb-[calc(3rem+env(safe-area-inset-bottom))] pl-[calc(1.25rem+env(safe-area-inset-left))]">
        <header className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <span className="relative flex size-11 items-center justify-center">
              <span
                className="absolute inset-0 chamfer-lg bg-ember/26 blur-[8px]"
                aria-hidden="true"
              />
              <HollowMask size={44} className="relative" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-4xl font-bold tracking-[0.24em] text-ink">{t.app.name}</span>
              <span className="mt-1 block text-xs tracking-[0.62em] text-ember/85">{t.app.kanji}</span>
            </span>
          </div>

          {/* Herói ao centro, dentro de uma coroa de raios de energia. */}
          <div className="relative flex items-center justify-center">
            <span className="pointer-events-none absolute -inset-14" aria-hidden="true">
              <SpiritBurst tone="ember" opacity={0.45} />
            </span>
            <HeroAvatar
              size={156}
              variant={2}
              hue={24}
              auraId="reiatsu-espectral"
              frameId="selo-shikai"
              maskStage="rachada"
              divisionId={11}
            />
          </div>

          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-ember-soft">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-ember" aria-hidden="true" />
            {t.app.tagline}
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-ember" aria-hidden="true" />
          </p>

          <div className="max-w-2xl">
            <h1 className="text-glow-ember text-balance font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl">
              {t.start.headline}
            </h1>
            <p className="mt-4 text-balance leading-relaxed text-ink-muted">{t.start.subheadline}</p>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <Card
              key={item.title}
              edge
              className="group flex items-start gap-3.5 p-4 transition-colors duration-200 hover:border-ember/45"
            >
              <span className="flex size-10 shrink-0 items-center justify-center chamfer-md bg-void-700 text-ember ring-1 ring-ember/25 transition-colors duration-200 group-hover:ring-ember/60">
                <ArtIcon name={item.emblem} size={21} />
              </span>
              <div>
                <p className="font-display text-lg font-semibold leading-tight text-ink">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.text}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="primary" size="lg" icon="Play" onClick={() => navigate('/onboarding')}>
            {t.start.beginJourney}
          </Button>
          <Button variant="secondary" size="lg" icon="Sparkles" onClick={startDemo}>
            {t.start.exploreDemo}
          </Button>
          {hasProfile && (
            <Button variant="ghost" size="lg" icon="ArrowRight" onClick={() => navigate('/')}>
              {t.start.continue}
            </Button>
          )}
        </div>

        <Disclaimer>{t.disclaimer.start}</Disclaimer>
      </div>
    </div>
  )
}
