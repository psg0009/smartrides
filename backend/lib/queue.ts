import { Queue } from 'bullmq';
const connection = { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) };
export const emailQueue = new Queue('email', { connection }); 