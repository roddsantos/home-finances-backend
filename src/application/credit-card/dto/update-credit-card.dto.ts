export class UpdateCreditCardDto {
  id: string
  name: string
  description?: string
  color: string
  flag: string
  limit: number
  day: number
  due: number
  month: number
  year: number
  isClosed: boolean
}
