import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import { ErrorHandler } from './controllers/error.js';
import logger from './utils/logger.js';
import router from './controllers/routes.js';
import { limiter } from './utils/util.js';

dotenv.config();

const port = process.env.PORT;
const uri =
    process.env.NODE_ENV === 'development'
        ? process.env.LOCAL_URI
        : process.env.URI;

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

//Set various HTTP headers to enhance security
app.use(helmet());

// compression middleware
app.use(compression());

//Limit repeated requests to prevent abuse
app.use('/', limiter);

// Protect against HTTP Parameter Pollution attacks
app.use(hpp());

//Routes
app.use('/', router);

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
