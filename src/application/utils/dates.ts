/**
 * Get the first day of a month as a Date type
 * @param {number} month month refered
 * @param {number} year year refered
 * @returns {Date} Date representing the first day of a month
 */
export function firstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1)
}

/**
 * Get the last day of a month as a Date type
 * @param {number} month month refered
 * @param {number} year year refered
 * @returns {Date} Date representing the last day of a month
 */
export function lastDayOfMonth(month: number, year: number) {
  return new Date(year, month + 1, 0)
}
