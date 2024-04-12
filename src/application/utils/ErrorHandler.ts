import { HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

export abstract class ErrorHandler {
  public static handle(error: HttpException) {
    try {
      throw error
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  public static UNPROCESSABLE_ENTITY_MESSAGE(message: string) {
    throw new HttpException(message, HttpStatus.UNPROCESSABLE_ENTITY)
  }

  public static errorResponse(res: Response, error: HttpException) {
    try {
      throw error
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }
}
