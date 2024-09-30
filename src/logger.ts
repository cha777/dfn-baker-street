import winston from 'winston';

class Logger {
  logger: winston.Logger;

  constructor() {
    const customFormat = winston.format.printf(({ level, message, timestamp }) => {
      return [timestamp, `[${level.toUpperCase()}]`, `${message}`].join(' ');
    });

    const logger = winston.createLogger({
      level: 'silly',
      format: winston.format.combine(winston.format.timestamp(), winston.format.align(), customFormat),
      transports: [
        new winston.transports.Console({
          level: 'info',
        }),
      ],
    });

    this.logger = logger;
  }
}

const { logger } = new Logger();
export default logger;
