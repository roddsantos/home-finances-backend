/* eslint-disable max-len */
import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { GeneralMiddleware } from '../general.middleware'
import * as path from 'path'
import { BILL_MODULE } from 'src/application/core/consts/filename.consts'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { UpdateBillTemplateDto } from 'src/application/core/types/bill'

@Injectable()
export class BodyQuickSavingMiddleware
  extends GeneralMiddleware
  implements NestMiddleware
{
  constructor() {
    super(path.join(__dirname, BILL_MODULE.bodyQuickSettingMiddleware))
  }
  use(req: Request, res: Response, next: NextFunction) {
    const body = req.body as unknown as UpdateBillTemplateDto

    const invalidKeys: Array<string> = []

    if (!body['id']) {
      invalidKeys.push(`id (missing id)`)
    }

    if (invalidKeys.length > 0) {
      this.logger.error(
        `invalid quick settle bill body key(s) : ${JSON.stringify(invalidKeys)}`,
        this.logDirectory
      )
      ErrorHandler.BAD_REQUEST(
        `middleware : invalid quick settle bill body key(s) : ${JSON.stringify(invalidKeys)}`
      )
    }

    next()
  }
}
