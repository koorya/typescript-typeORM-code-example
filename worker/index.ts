import { ExpressAdapter } from '@bull-board/express';
import * as express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { messageSenderQueue } from './queue/messageSenderQueue';
import { createConnections } from '../bot/connections';
import { eventManagerQueue } from './queue/eventManagerQueue';
import * as dotenv from 'dotenv';
import { logWorkerServiceInfo } from "../common/log_utils";
import { configure } from 'log4js';
import { updateEventManagerJob } from './job/updateEventManager.job';

dotenv.config();

(async () => {
  configure({
    appenders: {
      to_file: { type: 'file', filename: process.env.LOG_PATH + '/worker.log' },
      to_console: { type: 'console' },
    },
    categories: {
      default: { appenders: ['to_file', 'to_console'], level: 'all' },
    },
  });

  await createConnections();

  await updateEventManagerJob();

  const serverAdapter = new ExpressAdapter();

  const queues = await Promise.all([eventManagerQueue(), messageSenderQueue()]);

  const app = express();

  createBullBoard({
    queues: queues.map((queue) => new BullAdapter(queue)),
    serverAdapter: serverAdapter,
  });

  serverAdapter.setBasePath('/queues');

  app.use('/queues', serverAdapter.getRouter());

  const server = app.listen(parseInt(process.env.BULLBOADR_PORT));
  logWorkerServiceInfo('Bull interface started successfully!');

  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.once(signal, () => {
      server.close(() => logWorkerServiceInfo('express process terminated'));
      Promise.all(queues.map((queue) => queue.close()));
    });
  }
})();
