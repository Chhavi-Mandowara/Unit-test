/**
 * Simple logger service
 */
class Logger {
  constructor() {
    this.logs = [];
  }

  info(message, context = {}) {
    const logEntry = {
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString()
    };
    this.logs.push(logEntry);
    console.log(`[INFO] ${message}`, context);
  }

  error(message, error = null, context = {}) {
    const logEntry = {
      level: 'error',
      message,
      error: error?.message || error,
      context,
      timestamp: new Date().toISOString()
    };
    this.logs.push(logEntry);
    console.error(`[ERROR] ${message}`, { error, context });
  }

  warn(message, context = {}) {
    const logEntry = {
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString()
    };
    this.logs.push(logEntry);
    console.warn(`[WARN] ${message}`, context);
  }

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}

module.exports = Logger;