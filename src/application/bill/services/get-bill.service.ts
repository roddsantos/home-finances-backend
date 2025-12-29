import { GeneralService } from 'src/application/app/general/service.general'
import * as path from 'path'
import { InjectRepository } from '@nestjs/typeorm'
import { Bill } from '../bill.entity'
import { Repository } from 'typeorm'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { Injectable } from '@nestjs/common'
import { BILL_MODULE } from 'src/application/core/consts/filename.consts'

@Injectable()
export class GetBillService extends GeneralService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>
  ) {
    super(path.join(__dirname, BILL_MODULE.getBillService))
  }

  async getBillById(id: string) {
    try {
      return await this.billRepository.findOneBy({ id })
    } catch (error) {
      this.logger.error('Bills - Bill not found', this.logDirectory)
      ErrorHandler.NOT_FOUND_MESSAGE('Bills - Bill not found')
    }
  }
}
