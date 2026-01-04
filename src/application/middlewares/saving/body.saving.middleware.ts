import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { ThemeBody } from 'src/application/core/types/theme'
import { GeneralMiddleware } from '../general.middleware'
import * as path from 'path'
import { SAVING_MODULE } from 'src/application/core/consts/filename.consts'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'

@Injectable()
export class BodySavingMiddleware extends GeneralMiddleware implements NestMiddleware {
  constructor() {
    super(path.join(__dirname, SAVING_MODULE.bodyMiddleware))
  }
  use(req: Request, res: Response, next: NextFunction) {
    const body = req.body as unknown as ThemeBody

    const invalidKeys: Array<string> = []

    Object.keys(body).map((key) => {
      switch (key) {
        case 'month':
          if (body[key] < 0 || body[key] > 11) invalidKeys.push(`${key} (invalid month)`)
          break
        case 'total':
          if (body[key] < 0) invalidKeys.push(`${key} (invalid total)`)
          break
        case 'year':
          if (body[key] < 2024 || body[key] > 2080)
            invalidKeys.push(`${key} (invalid year)`)
          break
        default:
          if (!body[key]) invalidKeys.push(`${key}`)
      }

      if (invalidKeys.length > 0) {
        this.logger.error(
          `middleware : invalid saving body key(s) : ${JSON.stringify(invalidKeys)}`,
          this.logDirectory
        )
        ErrorHandler.BAD_REQUEST(
          `middleware : invalid saving body key(s) : ${JSON.stringify(invalidKeys)}`
        )
      }
    })

    next()
  }
}
