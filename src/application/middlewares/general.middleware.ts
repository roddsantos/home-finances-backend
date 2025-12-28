import { WinstonLogger } from '../utils/logging/winston.logger'

export class GeneralMiddleware {
  constructor(logDirectory: string) {
    this.logDirectory = logDirectory
  }
  public logDirectory
  public logger = new WinstonLogger()
}
