import winstonTimestampColorize from 'winston-timestamp-colorize';
import moment from 'moment';
import path from 'path';

import {
  createLogger,
  format as _format,
  transports as _transports,
} from 'winston';
import { getDirname } from './util.js';

const __dirname = getDirname(import.meta.url);
const { combine, timestamp, colorize, printf, splat } = _format;

const logFilePath = path.join(__dirname, '../logs', 'app.log'); // Specify the path to the log file

const logger = createLogger({
  format: combine(
    splat(),
    timestamp({
      format: () => moment.utc().format('YYYY-MM-DD HH:mm:ss') + ' UTC',
    }),
    colorize(),
    winstonTimestampColorize({ color: 'cyan' }),
    printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  level: 'debug',
  transports: [
    new _transports.Console({}),
    new _transports.File({ filename: logFilePath }), // Add the File transport
  ],
});

export default logger;
