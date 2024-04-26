export class GetBillsDto {
  userId: string
  page: number
  limit: number
  filters: string
  months?: number[]
  min?: number
  max?: number
  years?: number[]
  data?: string
  status?: 'all' | 'pending' | 'settled'
}

export type AvailableFilters =
  | 'month'
  | 'year'
  | 'typebill'
  | 'company'
  | 'creditcard'
  | 'bank'
  | 'min'
  | 'max'
  | 'status'

export type FilterDisplay = {
  id: string | number
  identifier: AvailableFilters
  name: string | number
}
