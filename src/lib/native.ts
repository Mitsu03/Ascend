import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

/** `true` dentro do wrapper nativo (iOS/Android), `false` no browser. */
export const isNative = Capacitor.isNativePlatform()

/**
 * Arranque específico da app nativa.
 *
 * Corre depois do primeiro render, para que o splash só desapareça quando já
 * há interface pintada por baixo — caso contrário vê-se um ecrã preto vazio
 * entre o splash e o React.
 *
 * No browser não faz nada: todas as chamadas são guardadas por `isNative`.
 */
export async function initNative(): Promise<void> {
  if (!isNative) return

  // Texto e ícones claros: o tema da app é escuro em todos os ecrãs.
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => {})

  if (Capacitor.getPlatform() === 'ios') {
    // O teclado tapa os campos em vez de encolher a webview; o layout usa
    // `position: fixed` nas barras e encolher partiria a barra inferior.
    await Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {})
  }

  await SplashScreen.hide().catch(() => {})
}
