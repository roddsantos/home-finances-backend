/* eslint-disable max-len */
import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { GeneralMiddleware } from '../general.middleware'
import * as path from 'path'
import { BANK_MODULE } from 'src/application/core/consts/filename.consts'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { UpdateBankTemplateDto } from 'src/application/core/types/bank'

@Injectable()
export class BodyUpdateBankMiddleware
  extends GeneralMiddleware
  implements NestMiddleware
{
  constructor() {
    super(path.join(__dirname, BANK_MODULE.bodyUpdateMiddleware))
  }
  use(req: Request, res: Response, next: NextFunction) {
    const body = req.body as unknown as UpdateBankTemplateDto

    const invalidKeys: Array<string> = []

    if (!body['id']) {
      invalidKeys.push(`id (missing id)`)
    }

    if (!body['userId']) {
      invalidKeys.push(`id (missing userId)`)
    }

    if (invalidKeys.length > 0) {
      this.logger.error(
        `invalid update bank body key(s) : ${JSON.stringify(invalidKeys)}`,
        this.logDirectory
      )
      ErrorHandler.BAD_REQUEST(
        `middleware : invalid update bank body key(s) : ${JSON.stringify(invalidKeys)}`
      )
    }

    next()
  }
}
