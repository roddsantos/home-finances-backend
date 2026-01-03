import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { GeneralMiddleware } from '../general.middleware'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'

@Injectable()
export class IdMiddleware extends GeneralMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params

    if (!id) {
      this.logger.error('Middleware : no id found', this.logDirectory)
      ErrorHandler.BAD_REQUEST('Middleware : no id found')
    }

    next()
  }
}
