/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_APIKEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
