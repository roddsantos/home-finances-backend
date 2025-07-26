export const convertToFloat = (value: number) => {
  if (!value) return 0
  return parseFloat(value.toFixed(2))
}
