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
}

export class UpdateBankTransactionDto {
  bank1Id: string
  companyId?: string
  isPayment?: boolean
}

export class UpdateCreditCardBillDto {
  creditCard: string
  isRefund?: boolean
}

export class UpdateCompanyBillDto {
  company: string
  due: Date
}

export type AllUpdateBillProps = UpdateBillTemplateDto &
  UpdateBankTransactionDto &
  UpdateCreditCardBillDto &
  UpdateCompanyBillDto

export type UpdateBillBank = UpdateBillTemplateDto & UpdateBankTransactionDto

export type UpdateBillCreditCard = UpdateBillTemplateDto & UpdateCreditCardBillDto

export type UpdateBillCompany = UpdateBillTemplateDto & UpdateCompanyBillDto
