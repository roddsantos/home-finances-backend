import { Injectable } from '@nestjs/common'
import { UUID } from '../utils/uuid'
import { NewBankBillDto } from './bank-bill.dto'
import { BankService } from '../bank/bank.service'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Bank } from '../bank/bank.entity'
import { BankBill } from './bank-bill.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class BankBillService {
  private readonly uuid: UUID

  constructor(
    @InjectRepository(BankBill)
    private readonly bankBillService: Repository<BankBill>,
    private readonly bankService: BankService
  ) {}

  async createBankBill(
    newBankBillDto: NewBankBillDto,
    billId: string,
    total: number,
    isSettled: boolean
  ) {
    const { bank1Id, bank2Id, isPayment } = newBankBillDto

    const bank1 = await this.bankService.getOneById(bank1Id)
    if (!bank1) ErrorHandler.NOT_FOUND_MESSAGE('Bank not found')

    if (isSettled) {
      const newBank1Value: Bank = {
        ...bank1,
        savings: bank1.savings + total * (isPayment ? -1 : 1)
      }
      await this.bankService.update(bank1Id, newBank1Value)

      if (bank2Id) {
        const bank2 = await this.bankService.getOneById(bank2Id)
        if (!bank2) ErrorHandler.NOT_FOUND_MESSAGE('Bank 2 not found')
        const newBank2Value: Bank = {
          ...bank2,
          savings: bank2.savings + total * (isPayment ? 1 : -1)
        }
        await this.bankService.update(bank2Id, newBank2Value)
      }
    }

    const res = await this.bankBillService.save({
      ...newBankBillDto,
      billId
    })
    return res
  }
}
