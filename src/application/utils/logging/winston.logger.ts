import { Injectable, LoggerService } from '@nestjs/common'
import { createLogger, format, Logger, transports } from 'winston'
import 'winston-daily-rotate-file'

@Injectable()
export class WinstonLogger implements LoggerService {
  private readonly logger: Logger

  constructor() {
    const transport = new transports.DailyRotateFile({
      filename: '/logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })

    this.logger = createLogger({
      // change level if in dev environment versus production
      level: 'debug',
      format: format.combine(
        format.colorize({
          all: true,
          colors: { info: 'blue', error: 'red', warn: 'orange' }
        }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf((info) => `[${info.timestamp}] [${info.level}] : ${info.message}`)
      ),
      transports: [
        new transports.Console({
          level: 'info',
          format: format.combine(
            format.colorize(),
            format.printf((info) => `${info.message}`)
          )
        }),
        new transports.Console({
          level: 'error',
          format: format.combine(
            format.colorize(),
            format.printf((info) => `${info.message}`)
          )
        }),
        transport
      ]
    })

    if (process.env.NODE_ENV !== 'production') {
      // APP_ENV is accessed from env file
      this.logger.add(new transports.Console())
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context })
  }

  error(message: string, trace?: string) {
    this.logger.error({ message, trace })
  }

  warn(message: string, path: string) {
    this.logger.warn(path + ' - ' + message)
  }

  debug(message: string, path: string) {
    this.logger.debug(path + ' - ' + message)
  }

  info(message: string, path: string) {
    this.logger.info(message + ' - ' + path)
  }
}
