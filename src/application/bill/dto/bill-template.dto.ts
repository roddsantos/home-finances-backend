import {
  CreateBankTransactionDto,
  CreateCompanyBillDto,
  CreateCreditCardBillDto,
  CreateServiceBillDto
} from './bill-creation.dto'

export class CreateBillTemplateDto {
  name: string
  description: string
  categoryId: string
  total: number
  userId: string
  settled: boolean
  due: string
  paid: string
}

export type AllBillProps = CreateBillTemplateDto &
  CreateBankTransactionDto &
  CreateCompanyBillDto &
  CreateCreditCardBillDto

export type BillBank = CreateBillTemplateDto & CreateBankTransactionDto

export type BillCompany = CreateBillTemplateDto & CreateCompanyBillDto

export type BillCreditCard = CreateBillTemplateDto & CreateCreditCardBillDto

export type BillService2 = CreateBillTemplateDto & CreateServiceBillDto
