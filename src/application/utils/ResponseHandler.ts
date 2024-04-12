import { HttpStatus } from '@nestjs/common'
import { Response } from 'express'

export abstract class ResponseHandler {
  static type: string
  static entityReferenceResponse: string

  constructor() {
    ResponseHandler.type = new.target.name
    ResponseHandler.entityReferenceResponse = `${ResponseHandler.type} Response`
  }

  public static sendCreatedResponse(json: any, res: Response) {
    try {
      return res.status(HttpStatus.CREATED).json(json)
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }

  public static sendResponse(json: any, res: Response) {
    try {
      return res.status(HttpStatus.OK).json(json)
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }

  public static sendNoContentResponse(res: Response) {
    try {
      return res.status(HttpStatus.NO_CONTENT).json()
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }

  public static sendAcceptedResponse(json: any, res: Response) {
    try {
      return res.status(HttpStatus.ACCEPTED).json(json)
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }
}
