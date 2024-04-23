export class CreateBankTransactionDto {
  bank1Id: string
  bank2Id?: string
}

export class CreateCreditCardBillDto {
  creditCardId: string
  companyId?: string
}

export class CreateCompanyBillDto {
  companyId: string
  creditCardId?: string
  parcels?: number
  delta?: number
  due?: Date
  taxes?: number
}

export class CreateServiceBillDto {
  bank1Id: string
  creditCardId: string
  companyId: string
  parcels: number
  delta: number
  due: Date
  taxes: number
}
