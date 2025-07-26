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
  | 'name'
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
  | 'date1'
  | 'date2'
  | 'moneyflux'

export type FilterDisplay = {
  id: string | number
  identifier: AvailableFilters
  name: string | number
}

export type GroupedFilterType = {
  field: string
  value: any
}
