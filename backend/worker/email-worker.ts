import { Worker } from 'bullmq';
import { sendEmail } from '../lib/email';

const connection = { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) };

new Worker('email', async (job: any) => {
  await sendEmail(job.data);
}, { connection }); 