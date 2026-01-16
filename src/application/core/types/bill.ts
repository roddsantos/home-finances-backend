export type BillObjectType = {
  id: string
  groupId: string
  name: string
  description: string
  total: number
  totalParcel: number
  settled: boolean
  parcels: number
  parcel: number
  taxes: number
  delta: number
  due: Date
  paid: Date | null
  type: string
  companyId: string | null
  categoryId: string
  bank1Id: string | null
  bank2Id: string | null
  isRecurrent: boolean
  creditCardId: string | null
  isPayment: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type CreateBillTemplateDto = Omit<
  BillObjectType,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export type UpdateBillTemplateDto = Partial<BillObjectType>

export type GetBillsTemplateDto = {
  data?: string
  page: number
  limit: number
  userId: string
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
