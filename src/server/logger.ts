import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { Request, Response, NextFunction } from 'express';

// Ensure log directory exists
if (!fs.existsSync(config.storage.logDir)) {
  fs.mkdirSync(config.storage.logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.printf(
  (info) => {
    const { level, message, timestamp, ...metadata } = info;
    let msg = `${timestamp} [${level}] ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  }
);

// Create rotating file transport
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(config.storage.logDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: config.logging.rotation.size,
  maxFiles: `${config.logging.rotation.retentionDays}d`,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Handle rotation events
fileRotateTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info('Log file rotated', { oldFilename, newFilename });
});

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    config.logging.format === 'json' ? winston.format.json() : logFormat
  ),
  transports: [
    fileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        logFormat
      )
    })
  ]
});

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
}; 