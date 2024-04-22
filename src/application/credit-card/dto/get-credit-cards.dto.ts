export class GetCreditCardDto {
  year?: number
  month?: number
  isClosed?: boolean
  page: number
  limit: number
  userId: string
}
