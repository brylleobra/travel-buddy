import 'dotenv/config';
import cron from 'node-cron';
import { connectMongo } from '@tripsmith/db';
import { runDailyScrape } from './tasks/scrape.js';
import { runDealDetection } from './tasks/deals.js';

await connectMongo();

const tz = process.env.CRON_TZ || 'Asia/Manila';

// Run every day at 06:00 Asia/Manila
cron.schedule('0 6 * * *', async () => {
  console.log('[Worker] Daily job starting…', new Date().toISOString());
  await runDailyScrape();
  await runDealDetection();
  console.log('[Worker] Daily job done.', new Date().toISOString());
}, { timezone: tz });

// Optional: run on startup for testing
if (process.env.RUN_ON_STARTUP === '1') {
  await runDailyScrape();
  await runDealDetection();
}
