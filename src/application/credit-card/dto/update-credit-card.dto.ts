export class UpdateCreditCardDto {
  id: string
  name: string
  description?: string
  color: string
  limit: number
  month: string
  year: number
  isClosed: boolean
}
