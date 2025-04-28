import { MonthlySavingsTypes } from '../types/general'

export class NewMonthlySavingDto {
  bankId: string
  total: number
  month: number
  year: number
  type: MonthlySavingsTypes
}

export class UpdateMonthlySavingDto {
  id: string
  bankId: string
  total: number
  month: number
  year: number
  type: MonthlySavingsTypes
}
