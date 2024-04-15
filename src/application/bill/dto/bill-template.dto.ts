import {
  CreateBankTransactionDto,
  CreateCompanyBillDto,
  CreateCreditCardBillDto
} from './bill-creation.dto'

export class CreateBillTemplateDto {
  name: string
  description: string
  typeBillId: string
  total: number
  userId: string
  month: string
  year: number
  settled: boolean
}

export type AllBillProps = CreateBillTemplateDto &
  CreateBankTransactionDto &
  CreateCompanyBillDto &
  CreateCreditCardBillDto

export type BillBank = CreateBillTemplateDto & CreateBankTransactionDto

export type BillCompany = CreateBillTemplateDto & CreateCompanyBillDto

export type BillCreditCard = CreateBillTemplateDto & CreateCreditCardBillDto
