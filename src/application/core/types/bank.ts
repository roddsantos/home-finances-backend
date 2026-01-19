import { Bank } from 'src/application/bank/bank.entity'

export type BankObjectType = {
  id: string
  name: string
  description: string
  color: string
  savings: number
  isPiggyBank: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type CreateBankTemplateDto = Omit<
  Bank,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export type UpdateBankTemplateDto = Partial<Bank>
