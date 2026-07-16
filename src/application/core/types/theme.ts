export type ThemeObjectType = {
  id: string
  title: string
  description: string
  primary: string
  secondary: string
  background: string
  text1: string
  text2: string
  borderRadius: number
  borderWidth: string
  font1: string
  font2: string
  inputSize: string
  padding: string
  theme: string
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type ThemeBody = {
  title: string
  description: string
  primary: string
  secondary: string
  background: string
  text1: string
  text2: string
  borderRadius: number
  borderWidth: string
  font1: string
  font2: string
  inputSize: string
  padding: string
  theme: string
  userId: string
}

export type UpdateThemeBody = ThemeBody & {
  id: string
}
