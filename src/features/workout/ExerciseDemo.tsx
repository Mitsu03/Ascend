import { demoForExercise, videoForExercise } from '@/data/exerciseDemos'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

/**
 * Demonstração de um exercício.
 *
 * Sete exercícios têm vídeo com licença livre; os outros têm as duas posições
 * do movimento alternadas. A alternância é feita em CSS e não em JavaScript —
 * um treino mostra seis a oito destas ao mesmo tempo, e outros tantos
 * temporizadores a forçar `render` davam o mesmo resultado visual a gastar
 * bateria.
 */
export function ExerciseDemo({
  exerciseId,
  exerciseName,
  className,
}: {
  exerciseId: string
  exerciseName: string
  className?: string
}) {
  const { t } = useI18n()
  const video = videoForExercise(exerciseId)
  const frames = demoForExercise(exerciseId)
  if (!video && !frames) return null

  return (
    <figure className={cn('m-0', className)}>
      <div
        className={cn(
          'relative overflow-hidden chamfer-md border border-void-600 bg-void-950',
          video ? 'aspect-video' : 'aspect-[3/2]',
        )}
      >
        {video ? (
          // Sem som, em ciclo e dentro da caixa: é uma demonstração, não um
          // filme. `playsInline` é o que impede o iOS de o atirar para ecrã
          // inteiro por cima da app.
          <video
            src={video.src}
            aria-label={t.workout.demoAlt(exerciseName)}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          frames && (
            <>
              <img
                src={frames.start}
                alt={t.workout.demoAlt(exerciseName)}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
              <img
                src={frames.end}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 size-full animate-demo-flip object-cover"
              />
            </>
          )
        )}
      </div>
      {video && (
        // Exigido pela licença do vídeo.
        <figcaption className="mt-1.5 truncate text-[11px] text-ink-faint">
          {t.workout.demoCredit(video.author, video.license)}
        </figcaption>
      )}
    </figure>
  )
}
