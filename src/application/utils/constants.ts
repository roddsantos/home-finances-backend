import { DiscriminatedUnionToObjectType } from 'src/application/core/types/general'
import { AvailableFilters } from '../core/types/bill'

export const SEQUELIZE = 'sequelize'

export const DATA_SOURCE = 'DATA_SOURCE'

export const BANK_REPOSITORY = 'BANK_REPOSITORY'

export const INITIALIZE_FILTERS: DiscriminatedUnionToObjectType<
  AvailableFilters | 'date',
  any
> = {
  name: '',
  moneyflux: '',
  month: [],
  min: null,
  max: null,
  year: [],
  category: [],
  bank: [],
  company: [],
  creditcard: [],
  status: 'all',
  type: [],
  date1: '',
  date2: '',
  date: []
}

export const DAY_START = [4, 0, 0]
