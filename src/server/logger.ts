import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { config } from './config';
import { Request, Response, NextFunction } from 'express';

// Ensure log directory exists
import fs from 'fs';
if (!fs.existsSync(config.storage.logDir)) {
  fs.mkdirSync(config.storage.logDir, { recursive: true });
}

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.printf(({ level, message, timestamp, ...metadata }: LogEntry) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
          msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
      })
);

// Create rotating file transport
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(config.storage.logDir, '%DATE%-app.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: config.logging.rotation.size,
  maxFiles: `${config.logging.rotation.retentionDays}d`,
  format: logFormat,
});

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    fileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add error handling for the file transport
fileRotateTransport.on('rotate', (oldFilename: string, newFilename: string) => {
  logger.info('Log file rotated', { oldFilename, newFilename });
});

// Export a request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  next();
}; 