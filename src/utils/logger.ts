/**
 * Lightweight logging utility for development
 * Strips logs in production builds
 */

interface LogLevel {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

const createLogger = (level: number, prefix: string, consoleMethod: (...args: any[]) => void) => {
  return (...args: any[]) => {
    if (level >= CURRENT_LOG_LEVEL && __DEV__) {
      consoleMethod(`[${prefix}]`, ...args);
    }
  };
};

export const logger = {
  debug: createLogger(LOG_LEVELS.DEBUG, 'DEBUG', console.log),
  info: createLogger(LOG_LEVELS.INFO, 'INFO', console.info),
  warn: createLogger(LOG_LEVELS.WARN, 'WARN', console.warn),
  error: createLogger(LOG_LEVELS.ERROR, 'ERROR', console.error),
};

// Convenience methods for common patterns
export const logError = (context: string, error: any) => {
  logger.error(`${context}:`, error);
};

export const logWarning = (context: string, message: string) => {
  logger.warn(`${context}:`, message);
};

export const logInfo = (context: string, message: string) => {
  logger.info(`${context}:`, message);
};