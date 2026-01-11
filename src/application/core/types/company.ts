import { Company } from 'src/application/company/company.entity'

export type CompanyObjectType = {
  id: string
  name: string
  description: string
  color: string
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type CreateCompanyTemplateDto = Omit<
  Company,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export type UpdateCompanyTemplateDto = Partial<Company>
