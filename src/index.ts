import cron from 'node-cron';
import { BakerStreet } from './baker-street';
import { OrderOwner } from './constants';
import logger from './logger';

const cronExpression = Bun.env.CRON_EXPRESSION;
const maxRetries = parseInt(Bun.env.MAX_RETRY_ATTEMPTS, 10) || 3;

logger.info('Initialized');
logger.info(`Cron expression: ${cronExpression}`);
logger.info(`Max retry attempts: ${maxRetries}`);

const execute = async () => {
  logger.info('Executing cron job');

  let attempt = 1;
  const job = new BakerStreet();

  while (attempt <= maxRetries) {
    try {
      await job.initializePage();

      if (await job.isOrdersPlaceable()) {
        await job.placeOrder(OrderOwner.MySelf, Bun.env.FOOD_TYPE);
      } else {
        logger.error('Baker street service not available');
      }

      break;
    } catch (e) {
      logger.error(`Execution failed (attempt: ${attempt}): ${e}`);
      attempt += 1;
    }
  }

  job.terminate();
};

cron.schedule(cronExpression, execute);
