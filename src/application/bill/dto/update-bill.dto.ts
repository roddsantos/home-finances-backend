import { PaymentTypes } from 'src/application/types/general'

export class UpdateBillTemplateDto {
  id: string
  name: string
  description: string
  categoryId: string
  total: number
  settled: boolean
  due: Date
  paid: Date
  type: PaymentTypes
  groupId: string
}

export class UpdateBankTransactionDto {
  bank1Id: string
  bank2Id?: string
  companyId?: string
  isPayment?: boolean
}

export class UpdateCreditCardBillDto {
  creditCardId: string
  companyId?: string
  parcels?: number
  parcel?: number
  totalParcel?: number
  delta?: number
  taxes?: number
  isRefund: boolean
}

export class UpdateCompanyBillDto {
  companyId: string
  parcels: number
  bank1Id?: string
  creditCardId?: string
  totalParcel?: number
  due: Date
  delta?: number
  taxes?: number
  isRefund: boolean
}

export type AllUpdateBillProps = UpdateBillTemplateDto &
  UpdateBankTransactionDto &
  UpdateCreditCardBillDto &
  UpdateCompanyBillDto

export type UpdateBillBank = UpdateBillTemplateDto & UpdateBankTransactionDto

export type UpdateBillCreditCard = UpdateBillTemplateDto & UpdateCreditCardBillDto

export type UpdateBillCompany = UpdateBillTemplateDto & UpdateCompanyBillDto
