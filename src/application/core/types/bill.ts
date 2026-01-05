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
  companyId: string
  categoryId: string
  bank1Id: string
  bank2Id: string
  isRecurrent: boolean
  creditCardId: string
  isPayment: boolean
  userId: string
  createdAt: string
  updatedAt: string
  deletedAt: string
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
