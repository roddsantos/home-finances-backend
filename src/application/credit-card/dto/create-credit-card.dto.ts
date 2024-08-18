export class CreateCreditCardDto {
  name: string
  description?: string
  color: string
  userId: string
  limit: number
  day: number
  month: number
  year: number
  isClosed: boolean
}
