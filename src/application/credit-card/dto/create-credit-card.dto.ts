export class CreateCreditCardDto {
  name: string
  description?: string
  color: string
  userId: number
  limit: number
  month: string
  year: number
  isClosed: boolean
}
