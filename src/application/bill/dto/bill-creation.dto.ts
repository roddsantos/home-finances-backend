export class CreateBankTransactionDto {
  bank1Id: string
  bank2Id?: string
  isPayment: string
}

export class CreateCreditCardBillDto {
  creditCardId: string
  companyId?: string
  parcels: number
  parcel?: number
  totalParcel?: number
  delta?: number
  taxes?: number
  isRefund: boolean
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
  bank1Id?: string
  creditCardId?: string
  companyId: string
  parcels: number
  totalParcel?: number
  delta?: number
  due: Date
  taxes?: number
}
