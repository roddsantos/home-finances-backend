export class UpdateCreditCardDto {
  id: string
  name: string
  description?: string
  color: string
  limit: number
  month: number
  year: number
  isClosed: boolean
}
