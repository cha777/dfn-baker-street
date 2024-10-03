declare module 'bun' {
  interface Env {
    BROWSER_EXEC_PATH: string;

    BRAINX_URL: string;
    BRAINX_USERNAME: string;
    BRAINX_PASSWORD: string;

    FOOD_TYPE: string;

    CRON_EXPRESSION: string;
    MAX_RETRY_ATTEMPTS: string;

    EMAIL_TRANSPORT_EMAIL_HOST: string;
    EMAIL_TRANSPORT_EMAIL_SENDER: string;
    EMAIL_TRANSPORT_EMAIL_PASSWORD: string;
    EMAIL_TRANSPORT_EMAIL_TO: string;
  }
}
