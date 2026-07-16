import { Bill } from 'src/application/bill/bill.entity'
import { ItemTypes } from './general'

export type HomeSavingsType = {
  totalBanks: number
  totalSavingsPreview: number
  totalIncome: number
  countBanks: number
}

export type HomeSearchReturnItemType = {
  id: string
  type: ItemTypes
  title: string
  description: string
}

export type HomeExpensesResponseType = {
  sumOfBills: number
  numberOfBills: number
  delta: number
  paidBills: number
}

export type HomeSavingsResponseType = {
  countBanks: number
  totalBanks: number
  totalIncome: number
  totalSavingsPreview: number
}

export type HomeCreditCardResponseType = {
  count: number
  total: number
}

export type HomeRecentBillsResponseType = Bill[]
