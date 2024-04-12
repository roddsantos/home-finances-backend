import { Injectable } from '@nestjs/common'
import { TypeBill } from './type-bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'

@Injectable()
export class TypeBillService {
  constructor(private readonly typebillRepository: typeof TypeBill) {}

  async getAll() {
    try {
      const res = await this.typebillRepository.findAll()
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
