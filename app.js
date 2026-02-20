import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import apiRoutes from './src/routes/apiRoutes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

// Security & logging
app.use(helmet());
app.use(morgan('dev'));

// LAN-scoped CORS — allows any private network origin
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origin not allowed'));
    }
  },
}));

// Body parsing
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Central error handler — must be last
app.use(errorHandler);

export default app;
