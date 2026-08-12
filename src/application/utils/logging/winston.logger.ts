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
          colors: { info: 'blue', error: 'red', warn: 'yellow', log: 'white' }
        }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf((info) => `[${info.timestamp}] [${info.level}] : ${info.message}`)
      ),
      transports: [transport]
    })

    if (process.env.NODE_ENV !== 'production') {
      // APP_ENV is accessed from env file
      this.logger.add(new transports.Console())
    }
  }

  private reducePath(path: string) {
    if (!path) return ''
    const splittedPath = path.split('dist\\')
    return splittedPath[1] || ''
  }

  log(message: string, path?: string) {
    this.logger.verbose(`{${this.reducePath(path)}} - ${message}`)
  }

  error(message: string, path: string) {
    this.logger.error(`{${this.reducePath(path)}} - ${message}`)
  }

  warn(message: string, path: string) {
    this.logger.warn(`{${this.reducePath(path)}} - ${message}`)
  }

  debug(message: string, path: string) {
    this.logger.debug(`{${this.reducePath(path)}} - ${message}`)
  }

  info(message: string, path: string) {
    this.logger.info(`{${this.reducePath(path)}} - ${message}`)
  }
}
