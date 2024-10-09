export class CreateCreditCardDto {
  name: string
  description?: string
  color: string
  flag: string
  userId: string
  limit: number
  day: number
  due: number
  month: number
  year: number
  isClosed: boolean
}
