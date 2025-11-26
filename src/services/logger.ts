// src/services/logger.ts

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private log(level: LogLevel, context: string, message: string, meta?: object) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] [${level}] [${context}]: ${message}`;

    const logMethod = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;

    if (meta) {
      logMethod(formattedMessage, meta);
    } else {
      logMethod(formattedMessage);
    }
  }

  info(context: string, message: string, meta?: object) {
    this.log('INFO', context, message, meta);
  }

  warn(context: string, message: string, meta?: object) {
    this.log('WARN', context, message, meta);
  }

  error(context: string, message: string, meta?: object) {
    this.log('ERROR', context, message, meta);
  }
}

export const logger = new Logger();
