import { BankObjectType } from './bank'
import { BillObjectType } from './bill'
import { CategoryObjectType } from './category'
import { CompanyObjectType } from './company'
import { CreditCardObjectType } from './credit-card'
import {
  HomeCreditCardResponseType,
  HomeExpensesResponseType,
  HomeRecentBillsResponseType,
  HomeSavingsResponseType
} from './home'
import { ThemeObjectType } from './theme'

export type CacheGeneralType<T> = {
  expiresAt: Date
  data: T
}

export type CacheUser<T> = Record<string, CacheGeneralType<T>>

export type CachedBanks = CacheGeneralType<BankObjectType[]>

export type CachedCreditCards = CacheGeneralType<CreditCardObjectType[]>

export type CachedCategories = CacheGeneralType<CategoryObjectType[]>

export type CachedCompanies = CacheGeneralType<CompanyObjectType[]>

export type CachedBills = CacheGeneralType<{
  page: number
  pagination: number
  bills: BillObjectType[]
}>

export type CachedSettings = CacheGeneralType<{
  selectedTheme: string
  themes: ThemeObjectType[]
}>

export type CachedDashboard = CacheGeneralType<{
  monthlyBills: any
  creditCards: any
  moneyOverview: any
  topCategories: any
  calendar: any
}>

export type CachedHome = CacheGeneralType<{
  expenses: HomeExpensesResponseType
  savings: HomeSavingsResponseType
  creditCards: HomeCreditCardResponseType
  recentBills: HomeRecentBillsResponseType
}>

export type CacheSectionsType =
  | 'banks'
  | 'creditCards'
  | 'companies'
  | 'categories'
  | 'bills'
  | 'settings'
  | 'dashboard'
  | 'home'
