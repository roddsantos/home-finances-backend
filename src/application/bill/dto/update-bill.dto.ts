import { PaymentTypes } from 'src/application/core/types/general'

export class UpdateBillTemplateDto {
  id: string
  name: string
  description: string
  categoryId: string
  total: number
  settled: boolean
  due: string
  paid: string | null
  type: PaymentTypes
  groupId: string
  userId: string
  totalParcel: number
}

export class UpdateBankTransactionDto {
  bank1Id: string
  bank2Id?: string
  companyId?: string
  isPayment: boolean
  isRecurrent: boolean
}

export class UpdateCreditCardBillDto {
  creditCardId: string
  companyId?: string
  parcels?: number
  parcel?: number
  delta?: number
  taxes?: number
  isRecurrent: boolean
}

export class UpdateCompanyBillDto {
  companyId: string
  parcels: number
  bank1Id?: string
  due: string
  isRecurrent: boolean
  delta?: number
  taxes?: number
  creditCardId?: string
}

export type AllUpdateBillProps = UpdateBillTemplateDto &
  UpdateBankTransactionDto &
  UpdateCreditCardBillDto &
  UpdateCompanyBillDto

export type UpdateBillBank = UpdateBillTemplateDto & UpdateBankTransactionDto

export type UpdateBillCreditCard = UpdateBillTemplateDto & UpdateCreditCardBillDto

export type UpdateBillCompany = UpdateBillTemplateDto & UpdateCompanyBillDto
