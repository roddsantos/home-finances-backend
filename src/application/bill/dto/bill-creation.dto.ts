export class CreateBankTransactionDto {
  bank1: number
  bank2?: number
}

export class CreateCreditCardBillDto {
  creditCard: number
}

export class CreateCompanyBillDto {
  company: number
  parcels: number
  delta: number
  due: Date
  taxes: number
}
