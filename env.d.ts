/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_BASE_PATH?: string;
  readonly PUBLIC_INDEXING_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
