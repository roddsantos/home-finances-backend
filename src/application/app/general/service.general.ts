import { WinstonLogger } from 'src/application/utils/logging/winston.logger'
import { UUID } from 'src/application/utils/uuid'

export class GeneralService {
  constructor(logDirectory: string) {
    this.logDirectory = logDirectory
  }
  public uuid = new UUID()
  public logDirectory
  public logger = new WinstonLogger()
}
