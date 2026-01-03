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

    Object.keys(body).map((key) => {
      if (key === 'borderRadius' && (body[key] < 0 || body[key] > 20)) {
        this.logger.error(
          'Middleware : invalid theme body - border radius',
          this.logDirectory
        )
        ErrorHandler.BAD_REQUEST('Middleware : invalid theme body')
      }
      if (key !== 'borderRadius' && !body[key]) {
        this.logger.error('Middleware : invalid theme body', this.logDirectory)
        ErrorHandler.BAD_REQUEST('Middleware : invalid theme body')
      }
    })

    next()
  }
}
