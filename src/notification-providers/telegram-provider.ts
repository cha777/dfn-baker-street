import logger from '../logger';

class TelegramProvider {
  botURL: string;
  constructor() {
    this.botURL = `https://api.telegram.org/bot${Bun.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  }

  async sendNotification(isSuccessful: boolean, attempt: number, error?: Error) {
    const payload = {
      chat_id: Bun.env.TELEGRAM_BOT_CHANNEL_ID,
      text: [
        `**Date:** *${new Date().toISOString().split('T').shift()}*`,
        '',
        `**Status:** *${isSuccessful ? '✅ SUCCESS' : '❌ FAIL'}*`,
        `**Food Type:** *${Bun.env.FOOD_TYPE}*`,
        '',
        `**Attempt:** ${attempt}`,
      ].join('\n'),
      parse_mode: 'Markdown',
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(this.botURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (response.ok) {
        throw new Error('Request Failed');
      }

      clearTimeout(timeoutId);

      const responseBody = await response.json();
      if (responseBody.ok) {
        logger.info(`Telegram notification sent: ${JSON.stringify(responseBody)}`);
      } else {
        throw new Error(`${responseBody.error_code}: ${responseBody.description}`);
      }
    } catch (e) {
      logger.error(`Telegram notification failed: ${e}`);
    }
  }
}

export const provider = new TelegramProvider();
