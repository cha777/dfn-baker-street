declare module 'bun' {
  interface Env {
    CRONITOR_KEY: string;

    BRAINX_USERNAME: string;
    BRAINX_PASSWORD: string;
  }
}
