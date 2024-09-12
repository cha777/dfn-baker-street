declare module 'bun' {
  interface Env {
    BROWSER_EXEC_PATH: string;

    BRAINX_URL: string;
    BRAINX_USERNAME: string;
    BRAINX_PASSWORD: string;

    CRON_EXPRESSION: string;
  }
}
