import cron from 'node-cron';
import { Cronitor } from 'cronitor';
import { BakerStreet } from './baker-street';

const cronExpression = '*/1 * * * *';
// const cronExpression = '30 4 * * 3-5';

const execute = async () => {
  const job = new BakerStreet();
  await job.initializePage();

  if (await job.isOrdersPlaceable()) {
    console.log('ready');
  } else {
    console.log('try tomorrow');
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
