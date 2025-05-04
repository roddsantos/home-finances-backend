import { MonthlySavingsTypes } from '../types/general'

export class NewSavingDto {
  bankId: string
  total: number
  month: number
  year: number
  type: MonthlySavingsTypes
}

export class UpdateSavingDto {
  id: string
  bankId: string
  total: number
  month: number
  year: number
  type: MonthlySavingsTypes
}
