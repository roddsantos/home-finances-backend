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
  | 'category'
  | 'company'
  | 'creditcard'
  | 'bank'
  | 'min'
  | 'max'
  | 'status'
  | 'type'

export type FilterDisplay = {
  id: string | number
  identifier: AvailableFilters
  name: string | number
}
