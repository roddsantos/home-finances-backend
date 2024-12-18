import { CreateCreditCardDto } from '../../dto/create-credit-card.dto'

export const NewCreditCardData: CreateCreditCardDto = {
  name: 'Credit Card Test',
  description: 'Credit Card Test Description',
  color: '#000000',
  flag: 'mastercard',
  userId: '123',
  limit: 1000,
  day: 10,
  due: 14,
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  isClosed: false
}
