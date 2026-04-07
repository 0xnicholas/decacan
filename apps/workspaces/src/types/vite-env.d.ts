/// <reference types="vite/client" />

declare const __INDUSTRY__: string;

interface ImportMetaEnv {
  readonly VITE_INDUSTRY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}