import { Injectable } from '@nestjs/common'
import { TypeBill } from './type-bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class TypeBillService {
  constructor(
    @InjectRepository(TypeBill)
    private readonly typebillRepository: Repository<TypeBill>
  ) {}

  async getAll() {
    try {
      const res = await this.typebillRepository.find()
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
