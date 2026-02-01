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
