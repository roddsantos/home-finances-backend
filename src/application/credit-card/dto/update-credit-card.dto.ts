export class UpdateCreditCardDto {
  id: number
  name: string
  description?: string
  color: string
  user: number
  limit: number
  month: string
  year: number
  isClosed: boolean
}
