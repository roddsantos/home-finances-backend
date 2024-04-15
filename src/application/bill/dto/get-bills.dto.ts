export class GetBillsDto {
  user: string
  page: number
  limit: number
  typeBill?: string
  month?: string
  year?: number
  settled?: boolean
}
