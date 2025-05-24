import { Between } from 'typeorm'

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
