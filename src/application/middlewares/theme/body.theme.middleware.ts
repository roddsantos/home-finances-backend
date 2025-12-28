import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { ThemeBody } from 'src/application/core/types/theme'
import { GeneralMiddleware } from '../general.middleware'
import * as path from 'path'
import { THEME_MODULE } from 'src/application/core/consts/filename.consts'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'

@Injectable()
export class BodyThemeMiddleware extends GeneralMiddleware implements NestMiddleware {
  constructor() {
    super(path.join(__dirname, THEME_MODULE.bodyMiddleware))
  }
  use(req: Request, res: Response, next: NextFunction) {
    const body = req.body as unknown as ThemeBody

    Object.values(body).map((value) => {
      if (!value) {
        this.logger.error(this.logDirectory + ' - Middleware : invalid theme body')
        ErrorHandler.BAD_REQUEST('Middleware : invalid theme body')
      }
    })

    next()
  }
}
