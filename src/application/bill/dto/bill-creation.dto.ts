import { Bank } from 'src/application/bank/bank.entity'
import { Company } from 'src/application/company/company.entity'
import { CreditCard } from 'src/application/credit-card/credit-card.entity'

export class CreateBankTransactionDto {
  bank1: Bank
  bank2?: Bank
}

export class CreateCreditCardBillDto {
  creditCard: CreditCard
}

export class CreateCompanyBillDto {
  company: Company
  parcels: number
  delta: number
  due: Date
  taxes: number
}
