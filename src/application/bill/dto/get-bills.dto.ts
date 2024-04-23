export class GetBillsDto {
  userId: string
  page: any
  limit: any
  typeBillId?: string
  month?: number
  year?: number
  settled?: boolean
}
