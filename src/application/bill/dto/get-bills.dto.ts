export class GetBillsDto {
  id: number
  page: number
  limit: number
  typeBill?: number
  month?: string
  year?: number
  settled?: boolean
}
