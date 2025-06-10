/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_APP_NAME: string
    readonly VITE_APP_VERSION: string
    readonly VITE_JWT_SECRET: string
    readonly VITE_JWT_EXPIRES_IN: string
    readonly VITE_ENABLE_ANALYTICS: string
    readonly VITE_ENABLE_MAINTENANCE_MODE: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }