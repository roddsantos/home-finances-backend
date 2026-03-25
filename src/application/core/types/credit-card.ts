import { CreditCard } from 'src/application/credit-card/credit-card.entity'

export type CreditCardObjectType = {
  id: string
  name: string
  description?: string
  color: string
  flag: string
  userId: string
  limit: number
  day: number
  due: number
  month: number
  year: number
  isClosed: boolean
  relatedBillId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type CreateCreditCardTemplateDto = Omit<
  CreditCard,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'limitLeft' | 'invoice' | 'userId'
> & {
  categoryId: string
  bank1Id: string
}

export type UpdateCreditCardTemplateDto = Partial<CreditCard>
