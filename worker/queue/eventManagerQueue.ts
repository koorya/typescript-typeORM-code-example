import * as Bull from 'bull';
import { updateEventManagerJob } from '../job/updateEventManager.job';
import { Queues } from './Queues';
import * as dotenv from 'dotenv';
import { logJobExecutionInfo } from "../../common/log_utils";

dotenv.config();

export const eventManagerQueue = async (): Promise<Bull.Queue> => {
  const queue = new Bull(Queues.UPDATE_EVENTS, {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    },
  });

  await Promise.race([
    queue.add(
      { jobName: Queues.UPDATE_EVENTS },
      {
        repeat: { every: parseInt(process.env.EVENT_MANAGER_EVERY_MIN) * 60 * 1000 },
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
    await updateEventManagerJob();
    logJobExecutionInfo(jobName, 'FINISH');
  });

  return queue;
};
