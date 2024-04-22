import {
  CreateBankTransactionDto,
  CreateCompanyBillDto,
  CreateCreditCardBillDto,
  CreateServiceBillDto
} from './bill-creation.dto'

export class CreateBillTemplateDto {
  name: string
  description: string
  typeBillId: string
  total: number
  userId: string
  month: number
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

export type BillService2 = CreateBillTemplateDto & Partial<CreateServiceBillDto>
