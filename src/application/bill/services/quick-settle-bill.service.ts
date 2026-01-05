import { Injectable } from '@nestjs/common'
import * as path from 'path'
import { GeneralService } from 'src/application/app/general/service.general'
import { BILL_MODULE } from 'src/application/core/consts/filename.consts'
import { BillService } from '../bill.service'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { Bill } from '../bill.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BankService } from 'src/application/bank/bank.service'
import { CreateBillService } from './create-bill.service'
import { UpdateBillTemplateDto } from 'src/application/core/types/bill'

@Injectable()
export class QuickSettleBillService extends GeneralService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly billService: BillService,
    private readonly bankService: BankService,
    private readonly createBillService: CreateBillService
  ) {
    super(path.join(__dirname, BILL_MODULE.quickSettleBillService))
  }

  async quickSettle(id: string, data: UpdateBillTemplateDto) {
    try {
      this.logger.info(
        `quick updating bill : id : ${id} payload : ` +
          (Object.keys(data).length > 0 ? JSON.stringify(data) : 'none'),
        this.logDirectory
      )
      const bill = await this.billService.getBillById(id)
      const {
        bank1Id,
        bank2Id,
        totalParcel,
        parcel,
        parcels,
        delta,
        taxes,
        isPayment,
        isRecurrent
      } = bill

      const newDelta = parcel === parcels - 1 ? delta : 0
      const totalParcelToDeduct = totalParcel + taxes + newDelta

      const bank1 = await this.bankService.getOneById(bank1Id)
      this.billService.updateBank(bank1, totalParcelToDeduct, isPayment)

      if (bank2Id) {
        const bank2 = await this.bankService.getOneById(bank2Id)
        this.billService.updateBank(bank2, totalParcelToDeduct, !isPayment)
      }

      if (isRecurrent) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = bill
        this.createBillService.createRecurrentBill({
          ...rest,
          ...data
        })
      }

      const payload = {
        settled: true,
        paid: new Date(),
        ...data
      }

      return await this.billRepository.update(id, payload)
    } catch (error) {
      this.logger.error(`error quick updating bill :  id : ${id}`, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('bills - error quick updating bill')
    }
  }

  async reversingQuickSettle(id: string, data: UpdateBillTemplateDto) {
    try {
      this.logger.info(
        `reversing quick update bill : id : ${id} payload : ` +
          (Object.keys(data).length > 0 ? JSON.stringify(data) : 'none'),
        this.logDirectory
      )
      const bill = await this.billService.getBillById(id)
      const {
        bank1Id,
        bank2Id,
        totalParcel,
        parcel,
        parcels,
        delta,
        taxes,
        isPayment,
        isRecurrent
      } = bill

      if (isRecurrent) {
        this.logger.error(
          // eslint-disable-next-line max-len
          `error quick updating bill : cannot reverse a recurrent bill :  id : ${id}`,
          this.logDirectory
        )
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
          'bills - error quick updating bill : cannot reverse a recurrent bill'
        )
      }

      const newDelta = parcel === parcels - 1 ? delta : 0
      const totalParcelToDeduct = totalParcel + taxes + newDelta

      const bank1 = await this.bankService.getOneById(bank1Id)
      this.billService.updateBank(bank1, totalParcelToDeduct, !isPayment)

      if (bank2Id) {
        const bank2 = await this.bankService.getOneById(bank2Id)
        this.billService.updateBank(bank2, totalParcelToDeduct, isPayment)
      }

      const payload = {
        settled: false,
        paid: null,
        ...data
      }

      this.logger.info(`successful reversed quick update : id : ${id}`, this.logDirectory)
      return await this.billRepository.update(id, payload)
    } catch (error) {
      this.logger.error(`error quick updating bill :  id : ${id}`, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('bills - error quick updating bill')
    }
  }
}
