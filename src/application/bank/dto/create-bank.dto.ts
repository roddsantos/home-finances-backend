import { User } from 'src/application/user/user.entity'

export class CreateBankDto {
  name: string
  description: string
  color: string
  savings: number
  user: User
}
