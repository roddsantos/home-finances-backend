export class GetBillsDto {
  userId: string
  page: number
  limit: number
  typeBillId?: string
  month?: string
  year?: number
  settled?: boolean
}
