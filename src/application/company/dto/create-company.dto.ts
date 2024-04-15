import { User } from 'src/application/user/user.entity'

export class CreateCompanyDto {
  name: string
  description: string
  color: string
  user: User
}
