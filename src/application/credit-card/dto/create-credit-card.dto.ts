import { User } from 'src/application/user/user.entity'

export class CreateCreditCardDto {
  name: string
  description?: string
  color: string
  user: User
  limit: number
  month: string
  year: number
  isClosed: boolean
}
