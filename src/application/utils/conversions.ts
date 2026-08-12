import { HttpException } from '@nestjs/common'

export const convertToFloat = (value: number) => {
  if (!value) return 0
  return parseFloat(value.toFixed(2))
}

export const objectToString = (object: any) => {
  if (!object) return ''

  if (object instanceof HttpException) {
    return object.message
  }

  if (object instanceof Error) {
    return object.stack ?? object.message
  }

  if (typeof object === 'string') {
    return object
  }

  if (typeof object.message === 'string') {
    return object.message
  }

  try {
    return JSON.stringify(object)
  } catch {
    return String(object)
  }
}
