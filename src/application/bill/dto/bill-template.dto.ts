import { TypeBill } from 'src/application/type-bill/type-bill.entity'
import { User } from 'src/application/user/user.entity'
import {
  CreateBankTransactionDto,
  CreateCompanyBillDto,
  CreateCreditCardBillDto
} from './bill-creation.dto'

export class CreateBillTemplateDto {
  name: string
  description: string
  typeBill: TypeBill
  total: number
  user: User
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
