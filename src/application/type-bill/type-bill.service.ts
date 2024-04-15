import { Injectable } from '@nestjs/common'
import { TypeBill } from './type-bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Repository } from 'typeorm'

@Injectable()
export class TypeBillService {
  constructor(private readonly typebillRepository: Repository<TypeBill>) {}

  async getAll() {
    try {
      const res = await this.typebillRepository.find()
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
