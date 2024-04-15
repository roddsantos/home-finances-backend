export class UpdateBillTemplateDto {
  id: string
  name: string
  description: string
  total: number
  month: string
  year: number
  settled: boolean
}

export class UpdateBankTransactionDto {
  bank1: string
}

export class UpdateCreditCardBillDto {
  creditCard: string
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
