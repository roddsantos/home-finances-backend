export type DashboardBillsPerMonthType = {
  total: number
  count: number
  delta: number
  month: number
  year: number
}

export type DashboardSavingsType = {
  totalIncome: number
  totalBanks: number
  totalSettled: number
  totalSavings: number
  totalPending: number
  totalPreview: number
  piggyBanksProgression: any
}

export type DashboardSavingsPerMonthType = {
  savedValue: number
  delta: number
  month: number
  year: number
}

export type DashboardSavingType = {
  bank: string
  color: string
  total: number
  progression: DashboardSavingsPerMonthType[]
}
