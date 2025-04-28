export class NewBankBillDto {
  billId: string
  taxes: number
  bank1Id: string
  bank2Id?: string
  isPayment: boolean
}
