export class CreateBankTransactionDto {
  bank1Id: string
  bank2Id?: string
  companyId?: string
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
  bank1Id?: string
  creditCardId?: string
  parcels: number
  delta?: number
  taxes?: number
  totalParcel?: number
}

export class CreateServiceBillDto {
  bank1Id?: string
  creditCardId?: string
  companyId: string
  parcels: number
  totalParcel?: number
  delta?: number
  taxes?: number
}
