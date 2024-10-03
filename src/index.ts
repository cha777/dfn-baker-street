import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { BakerStreet } from './baker-street';
import { OrderOwner } from './constants';
import logger from './logger';

const cronExpression = Bun.env.CRON_EXPRESSION;
const maxRetries = parseInt(Bun.env.MAX_RETRY_ATTEMPTS, 10) || 3;

logger.info('Initialized');
logger.info(`Cron expression: ${cronExpression}`);
logger.info(`Max retry attempts: ${maxRetries}`);

const transporter = nodemailer.createTransport({
  host: Bun.env.EMAIL_TRANSPORT_EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: Bun.env.EMAIL_TRANSPORT_EMAIL_SENDER,
    pass: Bun.env.EMAIL_TRANSPORT_EMAIL_PASSWORD,
  },
});

const sendMail = async (isSuccessful: boolean, error?: Error) => {
  let mailOptions = {
    from: Bun.env.EMAIL_TRANSPORT_EMAIL_SENDER,
    to: Bun.env.EMAIL_TRANSPORT_EMAIL_TO,
    subject: `DFN Baker Street Order (${new Date().toISOString().split('T').shift()}) - ${
      isSuccessful ? 'Successful' : 'Failed'
    }`,
    text: `${isSuccessful ? `Order Placed for ${Bun.env.FOOD_TYPE}` : `Order Failed: ${error?.message}`}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email sent');
  } catch (e) {
    logger.error(`Email send failed: ${e}`);
  }
};

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

  sendMail(isSuccessful, error);
  job.terminate();
};

cron.schedule(cronExpression, execute);
