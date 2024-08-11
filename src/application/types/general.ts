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
