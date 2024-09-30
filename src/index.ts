import cron from 'node-cron';
import { BakerStreet } from './baker-street';
import { OrderOwner } from './constants';
import logger from './logger';

const cronExpression = Bun.env.CRON_EXPRESSION;

logger.info('Initialized');
logger.info(`Cron expression: ${cronExpression}`);

const execute = async () => {
  logger.info('Executing cron job');

  const job = new BakerStreet();

  try {
    await job.initializePage();

    if (await job.isOrdersPlaceable()) {
      await job.placeOrder(OrderOwner.MySelf, Bun.env.FOOD_TYPE);
    } else {
      logger.error('Baker street service not available');
    }
  } catch (e) {
    logger.error(`Execution failed: ${e}`);
  }

  job.terminate();
};

cron.schedule(cronExpression, execute);
