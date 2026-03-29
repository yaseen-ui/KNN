import { Request, Response, NextFunction } from 'express';
import config from '../config/config.js';

/**
 * Logger utility for consistent logging across the application
 */
export class Logger {
  static log(level: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };

    const logMessage = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'info':
        console.log(logMessage);
        break;
      case 'debug':
        if (config.logging.level === 'debug') {
          console.log(logMessage);
        }
        break;
    }
  }

  static info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  static error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  static warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  static debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }
}

/**
 * Express middleware for request logging
 */
export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || Math.random().toString(36);

  // Log incoming request
  Logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
  });

  // Intercept response to log it
  const originalSend = res.send;
  res.send = function (data: unknown) {
    const duration = Date.now() - start;
    Logger.info('Response sent', {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Express middleware for error handling
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  Logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
  });

  const statusCode =
    (err as any).statusCode || (err.message.includes('not found') ? 404 : 500);
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
};
