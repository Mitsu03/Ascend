import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/Toaster'
import { bootstrapSession } from '@/services/session'
import { useUserStore } from '@/store/userStore'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { NutritionPage } from '@/features/nutrition/NutritionPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { QuestsPage } from '@/features/quests/QuestsPage'
import { StartPage } from '@/features/start/StartPage'
import { WorkoutPage } from '@/features/workout/WorkoutPage'
import { WorkoutSessionPage } from '@/features/workout/WorkoutSessionPage'

// O Perfil carrega os gráficos (recharts); fica num chunk separado.
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)

function RequireProfile({ children }: { children: React.ReactNode }) {
  const profile = useUserStore((state) => state.profile)
  const location = useLocation()
  if (!profile) return <Navigate to="/inicio" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export default function App() {
  const profile = useUserStore((state) => state.profile)

  useEffect(() => {
    if (profile) bootstrapSession()
    // Corre uma vez por sessão e sempre que surge um perfil novo.
  }, [profile?.createdAt, profile])

  return (
    <>
      <Routes>
        <Route path="/inicio" element={<StartPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/treino/sessao"
          element={
            <RequireProfile>
              <WorkoutSessionPage />
            </RequireProfile>
          }
        />
        <Route
          element={
            <RequireProfile>
              <AppShell />
            </RequireProfile>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/treino" element={<WorkoutPage />} />
          <Route path="/nutricao" element={<NutritionPage />} />
          <Route path="/missoes" element={<QuestsPage />} />
          <Route
            path="/perfil"
            element={
              <Suspense fallback={<p className="py-16 text-center text-ink-muted">A carregar o perfil…</p>}>
                <ProfilePage />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
