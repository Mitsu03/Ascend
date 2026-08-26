import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Disclaimer } from '@/components/ui/Misc'
import { HeroAvatar } from '@/components/HeroAvatar'
import { loadDemoProfile } from '@/services/session'
import { useUserStore } from '@/store/userStore'

const HIGHLIGHTS = [
  { icon: 'Dumbbell', title: 'Planos de treino', text: 'Plano semanal gerado a partir do teu objetivo e equipamento.' },
  { icon: 'UtensilsCrossed', title: 'Calorias e macros', text: 'Registo rápido com catálogo de alimentos comuns em Portugal.' },
  { icon: 'Target', title: 'Missões diárias', text: 'Objetivos curtos que dão XP, moedas e mantêm a sequência viva.' },
  { icon: 'Trophy', title: 'Progresso visível', text: 'Níveis, atributos, conquistas e gráficos da tua evolução.' },
]

export function StartPage() {
  const navigate = useNavigate()
  const hasProfile = useUserStore((state) => state.profile !== null)

  const startDemo = () => {
    loadDemoProfile()
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-8 px-5 py-10">
      <header className="flex flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-electric to-violet-deep">
            <Icon name="Zap" size={24} className="text-night-950" strokeWidth={2.5} />
          </span>
          <span className="font-display text-4xl font-bold tracking-[0.2em] text-ink">ASCEND</span>
        </div>
        <div className="max-w-xl">
          <h1 className="text-balance text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Torna-te o protagonista da tua evolução
          </h1>
          <p className="mt-3 text-balance leading-relaxed text-ink-muted">
            Treinos, nutrição e hábitos transformados numa jornada com níveis, missões e conquistas. Tudo
            offline, sem contas nem subscrições.
          </p>
        </div>
        <HeroAvatar size={132} variant={1} hue={195} auraId="aura-ciano" frameId="moldura-aurora" />
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {HIGHLIGHTS.map((item) => (
          <Card key={item.title} className="flex items-start gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-night-700 text-cyan-electric">
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
          Começar a minha jornada
        </Button>
        <Button variant="secondary" size="lg" icon="Sparkles" onClick={startDemo}>
          Explorar com dados de demonstração
        </Button>
        {hasProfile && (
          <Button variant="ghost" size="lg" icon="ArrowRight" onClick={() => navigate('/')}>
            Continuar onde ficaste
          </Button>
        )}
      </div>

      <Disclaimer>
        A Ascend calcula estimativas de calorias e macronutrientes para gestão pessoal. Não substitui
        aconselhamento médico ou nutricional. Em caso de dúvida, fala com um profissional de saúde.
      </Disclaimer>
    </div>
  )
}
