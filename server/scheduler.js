// server/scheduler.js
const cron = require('node-cron');
const { fetchAllArticles } = require('./services/rssParserService');
const connectDB = require('./config/db'); // To ensure DB is connected before running tasks
const mongoose = require('mongoose');

// Define the schedule (e.g., every hour)
// Cron pattern: second minute hour day-of-month month day-of-week
// '0 * * * *' means "at minute 0 of every hour"
const SCHEDULE = process.env.ARTICLE_FETCH_SCHEDULE || '0 */1 * * *'; // Default: every hour

let scheduledTask;

const startScheduler = async () => {
  // Ensure DB is connected
  // Mongoose handles connection pooling, so this mainly ensures the initial connect has happened.
  if (mongoose.connection.readyState !== 1) { // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    console.log('Scheduler: Waiting for DB connection...');
    await connectDB(); // This will attempt to connect if not already.
  }

  if (cron.validate(SCHEDULE)) {
    console.log(`Scheduler started. Articles will be fetched on schedule: ${SCHEDULE}`);
    scheduledTask = cron.schedule(SCHEDULE, async () => {
      console.log('Running scheduled article fetch...');
      await fetchAllArticles();
    }, {
      scheduled: true,
      timezone: "Etc/UTC" // Specify timezone, important for consistency
    });

    // Optional: Run once immediately on startup if desired
    // console.log('Running initial article fetch on startup...');
    // await fetchAllArticles();

  } else {
    console.error(`Invalid cron schedule: ${SCHEDULE}. Scheduler not started.`);
  }
};

const stopScheduler = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    console.log('Scheduler stopped.');
  }
};

module.exports = { startScheduler, stopScheduler };