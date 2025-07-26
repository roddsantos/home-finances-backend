import { HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

export abstract class ErrorHandler {
  static type: any
  static entityReferenceError: any

  public static handle(error: HttpException) {
    throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
  }

  public static errorResponse(res: Response, error: HttpException) {
    try {
      throw error
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }

  public static UNPROCESSABLE_ENTITY_MESSAGE(message: string) {
    throw new HttpException(message, HttpStatus.UNPROCESSABLE_ENTITY)
  }

  public static INTERNAL_SERVER_ERROR(message: string) {
    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR)
  }

  public static CONFLICT_MESSAGE(message: string) {
    throw new HttpException(message, HttpStatus.CONFLICT)
  }

  public static NOT_FOUND_MESSAGE(message: string) {
    throw new HttpException(message, HttpStatus.NOT_FOUND)
  }

  public static SOME_PROMISE_NOT_COMPLETED_MESSAGE(message: string) {
    throw new HttpException(message, HttpStatus.I_AM_A_TEAPOT)
  }

  public static NOT_ACCEPTABLE(message: string) {
    throw new HttpException(message, HttpStatus.NOT_ACCEPTABLE)
  }

  public static BAD_REQUEST(message: string) {
    throw new HttpException(message, HttpStatus.BAD_REQUEST)
  }
}
