import { HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

export abstract class ErrorHandler {
  static type: any
  static entityReferenceError: any

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

  public static CONFLICT_MESSAGE(message: string) {
    throw new HttpException(message, HttpStatus.CONFLICT)
  }

  public static NOT_FOUND_MESSAGE(message: string) {
    throw new HttpException(message, HttpStatus.NOT_FOUND)
  }

  public static SOME_PROMISE_NOT_COMPLETED_MESSAGE(message: string) {
    throw new HttpException(message, HttpStatus.SOME_PROMISE_NOT_COMPLETED)
  }

  public static NOT_ACCEPTABLE(message: string) {
    throw new HttpException(message, HttpStatus.NOT_ACCEPTABLE)
  }
}
