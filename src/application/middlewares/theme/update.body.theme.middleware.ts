import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { UpdateThemeBody } from 'src/application/core/types/theme'
import { GeneralMiddleware } from '../general.middleware'
import * as path from 'path'
import { THEME_MODULE } from 'src/application/core/consts/filename.consts'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'

@Injectable()
export class UpdateBodyThemeMiddleware
  extends GeneralMiddleware
  implements NestMiddleware
{
  constructor() {
    super(path.join(__dirname, THEME_MODULE.updateBodyMiddleware))
  }
  use(req: Request, res: Response, next: NextFunction) {
    const body = req.body as unknown as UpdateThemeBody

    const invalidKeys: Array<string> = []

    Object.keys(body).map((key) => {
      if (!body.id) {
        this.logger.error(
          'middleware : invalid theme body - missing theme id',
          this.logDirectory
        )
        ErrorHandler.BAD_REQUEST('middleware : invalid theme body - missing theme id')
      }
      if (key === 'borderRadius' && (body[key] < 0 || body[key] > 20)) {
        invalidKeys.push(`${key} (invalid number)`)
      }
      if (key !== 'borderRadius' && !body[key]) {
        invalidKeys.push(`${key} (missing)`)
      }
    })

    if (invalidKeys.length > 0) {
      this.logger.error(
        `middleware : invalid theme body key(s) : ${JSON.stringify(invalidKeys)}`,
        this.logDirectory
      )
      ErrorHandler.BAD_REQUEST(
        `middleware : invalid theme body key(s) : ${JSON.stringify(invalidKeys)}`
      )
    }

    next()
  }
}
