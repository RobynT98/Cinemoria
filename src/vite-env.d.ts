/// <reference types="vite/client" />

// (Valfritt men trevligt: deklarera egna miljövariabler här)
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  // lägg till fler vid behov
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}