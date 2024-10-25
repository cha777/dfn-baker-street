import TelegramBot from 'node-telegram-bot-api';
import logger from './logger';

class CommandHandler {
  bot: TelegramBot;
  botURL: string;
  userState: Record<number, { step: string }>;

  constructor() {
    this.bot = new TelegramBot(Bun.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.botURL = `https://api.telegram.org/bot${Bun.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    this.userState = {};

    this.bindEvents();
  }

  bindEvents() {
    logger.info('Binding Telegram bot events');

    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;

      if (this.userState[chatId]) {
        switch (this.userState[chatId].step) {
          case 'asking_name':
            const name = msg.text;
            this.bot.sendMessage(chatId, `Thank you, ${name}. You are now registered.`);
            this.bot.sendMessage(chatId, 'Please enter your active working days');
            break;

          default:
            logger.info(`Unknown state: ${this.userState[chatId].step}`);
        }
      }
    });

    this.bot.onText(/\/register/, (msg) => {
      const chatId = msg.chat.id;

      this.userState[chatId] = { step: 'asking_name' };
      this.bot.sendMessage(chatId, 'Please enter your name:');
    });

    this.bot.sendChatAction;
  }
}

const handler = new CommandHandler();
export default handler;
