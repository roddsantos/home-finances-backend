export class CreateCreditCardDto {
  name: string
  description?: string
  color: string
  userId: string
  limit: number
  month: string
  year: number
  isClosed: boolean
}
