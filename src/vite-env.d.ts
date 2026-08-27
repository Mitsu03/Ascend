/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Configuração de visão embutida na build, para não ter de a colar em cada
   * dispositivo novo. Ver `.env.example`.
   *
   * Fica dentro do bundle JavaScript e é legível por quem receba a app — usar
   * apenas em builds pessoais, nunca numa que vá para testers.
   */
  readonly VITE_VISION_API_KEY?: string
  readonly VITE_VISION_ENDPOINT?: string
  readonly VITE_VISION_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
