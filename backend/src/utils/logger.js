import winston from 'winston';
import dotenv from 'dotenv';

import requireEnv from './requireEnv.js';

dotenv.config();
requireEnv(['LOG_LEVEL']);

const { LOG_LEVEL: logLevel } = process.env;

const dev = process.env.NODE_ENV === 'development';

const { createLogger, format, transports } = winston;

/**
 * Defined format, files and levels for winston logging
 */
export const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.File({ filename: 'app.log' }),
    new transports.File({ filename: 'debug.log', level: 'debug' }),
    new transports.Console({
      format: format.combine(
        format.prettyPrint({ depth: 2, colorize: false }),
        format.colorize({ all: true }),
      ),
      level: logLevel || (dev ? 'debug' : 'warning'),
    }),
  ],
});
