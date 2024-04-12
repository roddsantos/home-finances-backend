export class CreateBillTemplateDto {
  name: string
  description: string
  typeBill: number
  total: number
  user: number
  month: string
  year: number
  settled: boolean
}
