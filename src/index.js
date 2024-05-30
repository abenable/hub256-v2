import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { ErrorHandler } from './controllers/errorController.js';
import { authRouter } from './routes/authRoutes.js';
import { getDirname, limiter } from './utils/util.js';
import { userRouter } from './routes/userRoutes.js';
import { blogRouter } from './routes/blogRoutes.js';
import logger from './utils/logger.js';
import path from 'path';

dotenv.config();

const port = process.env.PORT;
const uri =
  process.env.NODE_ENV === 'development'
    ? process.env.LOCAL_URI
    : process.env.URI;

const __dirname = getDirname(import.meta.url);

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)

app.set('trust proxy', 1);
app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

//Set various HTTP headers to enhance security

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', '*'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", 'https://api.hub256.live'],
    },
  })
);

/**
 * Limit repeated requests to prevent abuse
 */
app.use('/', limiter);

/**
 * Sanitize user-supplied data to prevent MongoDB Operator Injection
 */
app.use(mongoSanitize());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  // ... other headers
  next();
});

/**
 * Protect against HTTP Parameter Pollution attacks
 */
app.use(hpp());

//Routes

// Authentication routes
app.use('/auth', authRouter);

// User routes
app.use('/users', userRouter);

// Blog routes
app.use('/blog', blogRouter);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '../dist/index.html'));
});

/**
 * Handle all other routes that are not found
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Function} - The next middleware function with an error object
 */

// app.all('*', (req, res, next) => {
//   next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// Error handling middleware
app.use(ErrorHandler);

// Start the server
app.listen(port, async () => {
  logger.info(`Server running on port ${port}`);
  try {
    await mongoose.connect(uri);
    logger.info('Connected to the database.');
  } catch (error) {
    logger.error(error);
  }
});
