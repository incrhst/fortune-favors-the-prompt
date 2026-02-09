/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly DATABASE_URL: string;
    readonly VERCEL_AI_GATEWAY_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
