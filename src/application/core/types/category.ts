import { Category } from 'src/application/category/category.entity'

export type CategoryObjectType = {
  id: string
  name: string
  description: string
  color: string
  icon: string
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type CreateCategoryTemplateDto = Omit<
  Category,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'
>

export type UpdateCategoryTemplateDto = Partial<Category>
