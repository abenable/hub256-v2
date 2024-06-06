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
import { getDirname, limiter } from './utils/util.js';
import path from 'path';

dotenv.config();

const port = process.env.PORT;
const uri = process.env.URI;

const __dirname = getDirname(import.meta.url);

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

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '../dist/index.html'));
});

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
