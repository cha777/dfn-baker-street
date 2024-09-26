import cron from 'node-cron';
import { BakerStreet } from './baker-street';
import { OrderOwner } from './constants';

console.log('Initialized');

const cronExpression = Bun.env.CRON_EXPRESSION;

const execute = async () => {
  console.log('Executing cron job');

  const job = new BakerStreet();
  await job.initializePage();

  if (await job.isOrdersPlaceable()) {
    await job.placeOrder(OrderOwner.MySelf, Bun.env.FOOD_TYPE);
  } else {
    console.error('Baker street service not available');
  }

  job.terminate();
};

// const cronitor = new Cronitor(Bun.env.CRONITOR_KEY);
// cronitor.wraps(cron);
// cronitor.schedule('BakerStreet Order', cronExpression, execute);

cron.schedule(cronExpression, execute);

// const monitor = await cronitor.Monitor.put({
//   type: 'job',
//   key: 'important-background-job',
//   schedule: '0 0 * * *',
//   notify: ['slack:devops-alerts'],
// });
