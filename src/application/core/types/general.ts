export type PaymentTypes = 'creditCard' | 'money' | 'companyCredit'

export interface SuccessResponse<T> {
  data: T
  key: string
  error: null
}

export interface ErrorResponse {
  data: null
  key: string
  error: any
}

export type PromiseResult<T> = SuccessResponse<T> | ErrorResponse

export type SumAndCountType = {
  total: number
  count: number
}

export type MonthlySavingsTypes = 'start'

export type OptionalKeys<T> = {
  [K in keyof T]?: any
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {}

export type DiscriminatedUnionToObjectType<T extends string, V> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  Partial<Record<T, V>>
