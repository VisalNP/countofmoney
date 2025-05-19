const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { startScheduler, stopScheduler } = require('./scheduler');
const mongoose = require('mongoose');
const passport = require('passport');

const userRoutes = require('./routes/userRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const rssFeedRoutes = require('./routes/rssFeedRoutes');
const articleRoutes = require('./routes/articleRoutes'); 
const preferenceRoutes = require('./routes/preferenceRoutes');

require('./config/passportSetup');

dotenv.config(); 

const PORT = process.env.PORT || 5001;

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/cryptos', cryptoRoutes);
app.use('/api/rss-feeds', rssFeedRoutes);
app.use('/api/articles', articleRoutes); 
app.use('/api/preferences', preferenceRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const server = app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  if (mongoose.connection.readyState === 1) {
    await startScheduler();
  } else {
    mongoose.connection.once('open', async () => {
        console.log('MongoDB connected, starting scheduler...');
        await startScheduler();
    });
  }
});

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server');
  stopScheduler();
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDb connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received: closing HTTP server');
  stopScheduler();
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDb connection closed');
      process.exit(0);
    });
  });
});