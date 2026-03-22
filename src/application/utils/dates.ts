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

export function getNextDate(
  date: Date,
  monthDelta: number = 0,
  startFromThisMonth: boolean = false
) {
  if (!date) return null

  const dueDate = new Date(date)
  const dueDay = dueDate.getDate()
  const dueMonth = dueDate.getMonth()
  const dueYear = dueDate.getFullYear()

  const newYear = dueYear
  const newMonth = dueMonth + monthDelta
  const newDay =
    new Date(newYear, newMonth, dueDay).getDate() !== dueDay
      ? new Date(newYear, newMonth + 1, 0).getDate()
      : dueDay
  const newDate = new Date(newYear, startFromThisMonth ? newMonth - 1 : newMonth, newDay)

  return newDate
}
