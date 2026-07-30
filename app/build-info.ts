declare const __APP_VERSION__: number;
declare const __BUILD_TIME__: string;

export const BUILD_INFO = {
  version: __APP_VERSION__,
  builtAt: __BUILD_TIME__,
} as const;
