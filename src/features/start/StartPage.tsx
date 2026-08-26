import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Disclaimer } from '@/components/ui/Misc'
import { HeroAvatar } from '@/components/HeroAvatar'
import { useI18n } from '@/i18n'
import { loadDemoProfile } from '@/services/session'
import { useUserStore } from '@/store/userStore'

export function StartPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const hasProfile = useUserStore((state) => state.profile !== null)

  const highlights = [
    { icon: 'Dumbbell', title: t.start.highlights.workoutTitle, text: t.start.highlights.workoutText },
    { icon: 'UtensilsCrossed', title: t.start.highlights.nutritionTitle, text: t.start.highlights.nutritionText },
    { icon: 'Target', title: t.start.highlights.questsTitle, text: t.start.highlights.questsText },
    { icon: 'Trophy', title: t.start.highlights.progressTitle, text: t.start.highlights.progressText },
  ]

  const startDemo = () => {
    loadDemoProfile()
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-8 px-5 py-10">
      <header className="flex flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ember to-crimson">
            <Icon name="Zap" size={24} className="text-void-950" strokeWidth={2.5} />
          </span>
          <span className="font-display text-4xl font-bold tracking-[0.24em] text-ink">{t.app.name}</span>
        </div>
        <div className="max-w-xl">
          <h1 className="text-balance text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {t.start.headline}
          </h1>
          <p className="mt-3 text-balance leading-relaxed text-ink-muted">{t.start.subheadline}</p>
        </div>
        <HeroAvatar size={132} variant={1} hue={24} auraId="aura-ciano" frameId="moldura-aurora" />
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {highlights.map((item) => (
          <Card key={item.title} className="flex items-start gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-void-700 text-ember">
              <Icon name={item.icon} size={19} />
            </span>
            <div>
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{item.text}</p>
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
  )
}
