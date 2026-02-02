import { MonthlySavingsTypes } from 'src/application/core/types/general'

export class NewSavingDto {
  bankId: string
  total: number
  month: number
  year: number
  type: MonthlySavingsTypes
}

export class BulkSavingDto {
  month: number
  year: number
}

export class UpdateSavingDto {
  id: string
  bankId: string
  total: number
  month: number
  year: number
  type: MonthlySavingsTypes
}
