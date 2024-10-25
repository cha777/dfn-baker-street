import cron from 'node-cron';
import { BakerStreet } from './baker-street';
import notificationProvider from './notification-providers';
import { OrderOwner } from './constants';
import logger from './logger';
import './command-handler';

const cronExpression = Bun.env.CRON_EXPRESSION;
const maxRetries = parseInt(Bun.env.MAX_RETRY_ATTEMPTS, 10) || 3;

logger.info('Initialized');
logger.info(`Cron expression: ${cronExpression}`);
logger.info(`Max retry attempts: ${maxRetries}`);

const execute = async () => {
  logger.info('Executing cron job');

  let attempt = 1;
  let isSuccessful = false;
  let error: Error | undefined;

  const job = new BakerStreet();

  while (attempt <= maxRetries) {
    try {
      await job.initializePage();

      if (await job.isOrdersPlaceable()) {
        await job.placeOrder(OrderOwner.MySelf, Bun.env.FOOD_TYPE);
        isSuccessful = true;
      } else {
        error = new Error('Baker street service not available');
        logger.error('Baker street service not available');
      }

      break;
    } catch (e) {
      logger.error(`Execution failed (attempt: ${attempt}): ${e}`);
      attempt += 1;
      error = e as Error;
    }
  }

  notificationProvider.sendNotification(isSuccessful, attempt, error);
  job.terminate();
};

// cron.schedule(cronExpression, execute);
