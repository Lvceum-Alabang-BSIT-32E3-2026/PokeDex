/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_USE_LIVE_API: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}