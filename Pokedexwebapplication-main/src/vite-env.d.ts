/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_IDENTITY_API_URL: string;
    /** * Controlled via .env file. 
     * Set to 'true' to fetch from the backend, 'false' for mock data. 
     */
    readonly VITE_USE_LIVE_API: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}