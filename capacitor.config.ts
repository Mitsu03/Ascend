import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Configuração da app nativa.
 *
 * `iosScheme: 'https'` faz a WKWebView servir a app a partir de
 * `https://localhost` em vez de `capacitor://localhost`. É um contexto seguro
 * (a câmara via `getUserMedia` precisa disso) e é uma origem que os servidores
 * das APIs externas aceitam em CORS — ao contrário do esquema `capacitor://`.
 */
const config: CapacitorConfig = {
  appId: 'com.mitsu03.ascend',
  appName: 'Ascend',
  webDir: 'dist',
  ios: {
    // `ios.scheme` é o scheme de build do Xcode (o projeto só tem "App"), não
    // o esquema de URL da WebView — esse é o `server.iosScheme` acima.
    contentInset: 'never',
    // O tema é preto; evita o flash branco entre o splash e o primeiro render.
    backgroundColor: '#0c0e13',
  },
  server: {
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      // Escondido à mão em `initNative()`, quando o React já pintou.
      launchAutoHide: false,
      backgroundColor: '#0c0e13',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
    },
  },
}

export default config
