import { Between, In, IsNull, LessThanOrEqual, Like, MoreThanOrEqual, Or } from 'typeorm'
import { AvailableFilters, FilterDisplay } from '../bill/dto/get-bills.dto'
import { Bill } from '../bill/bill.entity'
import { OptionalKeys } from '../types/general'
import { initializeFilters } from './constants'

/**
 * Get filters treated and grouped
 * @param {FilterDisplay[]} filters array with the available filters
 * @returns object with filters grouped
 */
export function groupFilters(filters: FilterDisplay[]) {
  const groupedFilters = { ...initializeFilters }

  filters.forEach((filter) => {
    const { id, identifier } = filter
    switch (identifier) {
      case 'moneyflux':
      case 'name':
      case 'min':
      case 'max':
      case 'status':
      case 'date1':
      case 'date2':
        groupedFilters[identifier] = id
        break
      case 'month':
      case 'year':
        groupedFilters.date = [...groupedFilters.date, filter]
        break
      case 'category':
      case 'company':
      case 'creditcard':
      case 'bank':
      case 'type':
        groupedFilters[identifier] = [...groupedFilters[identifier], id]
        break
      default:
        break
    }
  })

  return groupedFilters
}

/**
 * Get an In operator when an array is passed
 * @param {Array<any>} array
 * @returns operator In
 */
export function getInOperatorForArrays(array: Array<any>) {
  return In([...array])
}

/**
 * Function to choose a month and/or a year and get a Netween typeorm operator
 * @param month month to be the filter - if ommited, gets the current month
 * (0 - 11, if month is less than 0, it filters the previous year
 * if month is greater than 11, year is year + 1)
 * @param year year to be filtered - if ommited, gets the current year
 * @returns {FindOperator<Date>} a Between typeorm filter operator
 */
export function getMonthBetweenOperator(month: number, year: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  return Between(firstDay, lastDay)
}

/**
 * Return an operator for outcome bills
 * @param isPayment flag to indicate if is a payment outcome
 * @returns {Object} a object with an operator and isPayment flag
 */
export function getOutcomeOperator(isPayment: boolean) {
  return {
    isPayment,
    bank2Id: IsNull()
  }
}

/**
 * Function to get an operator for term queries
 * @param {string | number} filter query to be found
 * @returns {FindOperator<string>} a Like typeorm filter operator
 */
export function getTermOperator(filter: string | number) {
  const term = typeof filter === 'string' ? (filter as string) : filter

  return Like(`%${term}%`)
}

/**
 * Function to get operators for each month with respective
 * years given
 * @param {FilterDisplay[]} filters array with all filters
 * @returns {FindOperator<Date>} an Or typeorm filter operator
 */
export function getDateOperators(filters: FilterDisplay[]) {
  const yearFilters = filters
    .filter((f) => f.identifier === 'year')
    .map((f) => f.id as number)

  const monthFilters = filters
    .filter((f) => f.identifier === 'month')
    .map((f) => f.id as number)

  const dates: Array<Date[]> = []

  if (monthFilters.length === 0) {
    yearFilters.forEach((year) =>
      dates.push([new Date(year, 0, 1), new Date(year, 11, 31)])
    )
  } else {
    yearFilters.forEach((year) =>
      monthFilters.forEach((month) =>
        dates.push([new Date(year, month, 1), new Date(year, month + 1, 0)])
      )
    )
  }

  return Or(...dates.map((d) => Between(d[0], d[1])))
}

/**
 * Get an object with all operators and fields
 * @param {FilterDisplay[]} filters array with all the filters
 * @returns object with all the filters
 */
export function operatorFilter(filters: FilterDisplay[]) {
  const finalFilter: OptionalKeys<Bill> = {}
  const groupedFiltersObject = groupFilters(filters)

  Object.keys(groupedFiltersObject).map((key: AvailableFilters | 'date') => {
    const value = groupedFiltersObject[key]
    switch (key) {
      case 'moneyflux':
        if (value) finalFilter.isPayment = (value as string) === 'outcome'
        break
      case 'name':
        if (value) finalFilter.name = getTermOperator(value as string)
        break
      case 'date':
        if (value.length) finalFilter.due = getDateOperators(value)
        break
      case 'min':
        if (value) finalFilter.totalParcel = MoreThanOrEqual(value as number)
        break
      case 'max':
        if (value) finalFilter.totalParcel = LessThanOrEqual(value as number)
        break
      case 'status':
        if (value !== 'all') {
          finalFilter.settled = value === 'settled'
        }
        break
      case 'category':
        if (value.length > 0) finalFilter.categoryId = getInOperatorForArrays(value)
        break
      case 'company':
        if (value.length > 0) finalFilter.companyId = getInOperatorForArrays(value)
        break
      case 'creditcard':
        if (value.length > 0) finalFilter.creditCardId = getInOperatorForArrays(value)
        break
      case 'bank':
        if (value.length > 0) finalFilter.bank1Id = getInOperatorForArrays(value)
        break
      case 'type':
        if (value.length > 0) {
          finalFilter.type = getInOperatorForArrays(value)
        }
        break
      case 'date1':
        if (value) finalFilter.due = MoreThanOrEqual(new Date(value))
        break
      case 'date2':
        if (value) finalFilter.due = LessThanOrEqual(new Date(value))
        break
      default:
        break
    }
  })

  return finalFilter
}
