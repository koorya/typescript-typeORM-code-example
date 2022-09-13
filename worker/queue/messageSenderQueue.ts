import * as Bull from 'bull';
import { sendMessagesJob } from '../job/sendMessage.job';
import { Queues } from './Queues';

import * as dotenv from 'dotenv';
import { logJobExecutionInfo } from "../../common/log_utils";

dotenv.config();

export const messageSenderQueue = async (): Promise<Bull.Queue> => {
  const queue = new Bull(Queues.SEND_MESSAGE, {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    },
  });

  await Promise.race([
    queue.add(
      { jobName: Queues.SEND_MESSAGE },
      {
        repeat: { every: parseInt(process.env.MESSAGE_SENDER_EVERY_MIN) * 60 * 1000 },
      },
    ),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout error: could not connect to Redis'));
      }, 5000);
    }),
  ]);

  queue.process(async (job) => {
    const { jobName } = job.data;
    logJobExecutionInfo(jobName, 'START');
    await sendMessagesJob();
    logJobExecutionInfo(jobName, 'FINISH');
  });

  return queue;
};
