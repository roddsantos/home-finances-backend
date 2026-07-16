import { HttpException } from '@nestjs/common'

export const convertToFloat = (value: number) => {
  if (!value) return 0
  return parseFloat(value.toFixed(2))
}

export const objectToString = (object: any) => {
  if (object instanceof HttpException) return object.message
  if (!object) return ''
  return JSON.stringify(object)
}
