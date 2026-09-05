import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Battery,
  Beef,
  Brain,
  Camera,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Coins,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Gift,
  Globe,
  Hammer,
  HeartPulse,
  Home,
  Image,
  Info,
  LineChart,
  ListChecks,
  Lock,
  Moon,
  PartyPopper,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Ruler,
  ScanBarcode,
  Scale,
  Search,
  Settings,
  Shield,
  Sparkles,
  Square,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trash2,
  Trophy,
  User,
  UtensilsCrossed,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Registo explícito de ícones — mantém o bundle pequeno e os nomes tipados. */
export const ICONS = {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Battery,
  Beef,
  Brain,
  Camera,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Coins,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Gift,
  Globe,
  Hammer,
  HeartPulse,
  Home,
  Image,
  Info,
  LineChart,
  ListChecks,
  Lock,
  Moon,
  PartyPopper,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Ruler,
  ScanBarcode,
  Scale,
  Search,
  Settings,
  Shield,
  Sparkles,
  Square,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trash2,
  Trophy,
  User,
  UtensilsCrossed,
  X,
  Zap,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

interface IconProps {
  name: string
  className?: string
  size?: number
  strokeWidth?: number
}

/*
 * `strokeWidth` a 1,5 é o traço do sistema Bleach: o desenho especifica um
 * sprite de 30 símbolos com `stroke-width:1.5`, `stroke:currentColor` e sem
 * preenchimento. O lucide já é essa linguagem — o que estava fora era a
 * espessura, que a 2 px fazia os ícones lerem mais pesados do que o texto ao
 * lado deles. O sprite em si fica por portar: cobre 30 dos 58 ícones que a app
 * usa, e os restantes (código de barras, régua, pesquisa) não existem lá.
 */
export function Icon({ name, className, size = 18, strokeWidth = 1.5 }: IconProps) {
  const Component = (ICONS as Record<string, LucideIcon>)[name] ?? Circle
  return <Component className={className} size={size} strokeWidth={strokeWidth} aria-hidden="true" />
}
