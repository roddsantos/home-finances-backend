import { Injectable } from '@nestjs/common'
import { CreateCreditCardDto } from './dto/create-credit-card.dto'
import { CreditCard } from './credit-card.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { UpdateCreditCardDto } from './dto/update-credit-card.dto'
import { GetCreditCardDto } from './dto/get-credit-cards.dto'

@Injectable()
export class CreditCardService {
  constructor(private readonly creditCardRepository: typeof CreditCard) {}

  async create(createCreditCard: CreateCreditCardDto) {
    try {
      const res = await this.creditCardRepository.create(createCreditCard)
      return res.id
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(updateCreditCardDto: UpdateCreditCardDto) {
    try {
      const res = await this.creditCardRepository.update(updateCreditCardDto, {
        where: { id: updateCreditCardDto.id }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: number) {
    try {
      const res = await this.creditCardRepository.destroy({ where: { id } })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getAllById(filters: GetCreditCardDto) {
    try {
      const res = await this.creditCardRepository.findAll<CreditCard>({
        where: { ...filters }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
