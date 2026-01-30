import { ValidatedTokenDataType } from '../../../src/application/core/types/auth'

declare global {
  namespace Express {
    interface Request {
      user?: ValidatedTokenDataType
    }
  }
}

export {}
