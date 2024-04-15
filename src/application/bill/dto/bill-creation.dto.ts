export class CreateBankTransactionDto {
  bank1Id: string
  bank2Id?: string
}

export class CreateCreditCardBillDto {
  creditCardId: string
}

export class CreateCompanyBillDto {
  companyId: string
  parcels: number
  delta: number
  due: Date
  taxes: number
}
