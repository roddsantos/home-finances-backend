import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'

@Injectable()
export class DateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { month, year } = req.query

    if (!month || !year)
      return ErrorHandler.BAD_REQUEST('Home - No month and/or year found')

    if (parseInt(month as string) > 11 || parseInt(month as string) < 0)
      return ErrorHandler.BAD_REQUEST('Home - Invalid month')

    if (parseInt(year as string) > 2080 || parseInt(year as string) < 2024)
      return ErrorHandler.BAD_REQUEST('Home - Invalid year')

    next()
  }
}
