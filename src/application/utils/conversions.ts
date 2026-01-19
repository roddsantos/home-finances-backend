export const convertToFloat = (value: number) => {
  if (!value) return 0
  return parseFloat(value.toFixed(2))
}

export const objectToString = (object: any) => {
  if (!object) return ''
  return JSON.stringify(object)
}
