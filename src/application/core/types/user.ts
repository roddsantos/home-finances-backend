import { User } from 'src/application/user/user.entity'

export type UserObjectType = {
  id: string
  name: string
  surname: string
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type CreateUserTemplateDto = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export type UpdateUserTemplateDto = Partial<User>
