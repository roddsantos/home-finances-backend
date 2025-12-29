import { GeneralService } from 'src/application/app/general/service.general'
import * as path from 'path'
import { Repository } from 'typeorm'
import { BillBank, BillCompany, BillCreditCard } from '../dto/bill-template.dto'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { BankService } from 'src/application/bank/bank.service'
import { BillService } from '../bill.service'
import { Bill } from '../bill.entity'
import { CreditCardService } from 'src/application/credit-card/credit-card.service'
import { CreditCard } from 'src/application/credit-card/credit-card.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BILL_MODULE } from 'src/application/core/consts/filename.consts'
import { UpdateBillBank } from '../dto/update-bill.dto'

@Injectable()
export class CreateBillService extends GeneralService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly bankService: BankService,
    private readonly billService: BillService,
    private readonly ccService: CreditCardService
  ) {
    super(path.join(__dirname, BILL_MODULE.createBillService))
  }

  async createTransactionBill(createTransactionBillDto: BillBank) {
    try {
      const { total, bank1Id, bank2Id, isPayment, settled } = createTransactionBillDto

      if (!settled) {
        return await this.billRepository.save({
          ...createTransactionBillDto,
          totalParcel: total
        })
      }

      const bank1 = await this.bankService.getOneById(bank1Id)
      if (!bank1) {
        this.logger.error('Bills - Bank 1 not found', this.logDirectory)
        ErrorHandler.NOT_FOUND_MESSAGE('Bills - Bank 1 not found')
      }
      await this.billService.updateBank(bank1, total, isPayment)

      if (bank2Id) {
        const bank2 = await this.bankService.getOneById(bank2Id)
        if (!bank2) {
          this.logger.error('Bills - Bank 2 not found', this.logDirectory)
          ErrorHandler.NOT_FOUND_MESSAGE('Bills - Bank 2 not found')
        }
        await this.billService.updateBank(bank2, total, !isPayment)
      }
      return await this.billRepository.save({
        ...createTransactionBillDto,
        totalParcel: total
      })
    } catch (error) {
      this.logger.error(
        +'Bills - Error creating transaction bill : ' + error,
        this.logDirectory
      )
      return ErrorHandler.handle()
    }
  }

  async createCompanyCreditBill(createCompanyBillDto: BillCompany) {
    try {
      const groupId = this.uuid.v4()

      const bills = this.billService.parcelsCompanyCreditBills(createCompanyBillDto)

      const allBills = await Promise.all(
        bills.map((b) => {
          const res = this.billRepository.save({ ...b, groupId })
          return res
        })
      )
      return allBills
    } catch (error) {
      this.logger.error(
        'Bills - Error creating company bill : ' + error,
        this.logDirectory
      )
      return ErrorHandler.handle()
    }
  }

  async createCreditCardBill(createCreditCardBillDto: BillCreditCard) {
    try {
      const { creditCardId, total, taxes, delta, settled } = createCreditCardBillDto
      const groupId = this.uuid.v4()

      const bills = this.billService.parcelsCcBills(createCreditCardBillDto)
      if (settled) {
        const cc = await this.ccService.getOneById(creditCardId, {
          isClosed: false
        })
        if (cc) {
          const newCcObject: CreditCard = {
            ...cc,
            limit: cc.limit + (total + taxes + delta) * -1,
            invoice: cc.invoice + bills[0].totalParcel * -1
          }
          await this.ccService.update(creditCardId, newCcObject)
        } else throw ErrorHandler.CONFLICT_MESSAGE("This card can't be used")
      }

      const allBills = await Promise.all(
        bills.map((b) => {
          const res = this.billRepository.save({ ...b, groupId })
          return res
        })
      )
      return allBills
    } catch (error) {
      this.logger.error(
        'Bills - Error creating credit card bill : ' + error,
        this.logDirectory
      )
      return ErrorHandler.handle()
    }
  }

  async createRecurrentBill(data: Omit<UpdateBillBank, 'id'>) {
    try {
      const dueDate = new Date(data.due)
      const dueDay = dueDate.getDate()
      const dueMonth = dueDate.getMonth()
      const dueYear = dueDate.getFullYear()

      const newYear = dueMonth + 1 > 11 ? dueYear + 1 : dueYear
      const newMonth = dueMonth + 1 > 11 ? 0 : dueMonth + 1
      const newDay =
        new Date(newYear, newMonth, dueDay).getDate() !== dueDay
          ? new Date(newYear, newMonth + 1, -1).getDate()
          : dueDay

      const newDue = new Date(newYear, newMonth, newDay).toISOString()

      await this.createTransactionBill({
        ...data,
        due: newDue,
        settled: false,
        paid: null
      })
      this.logger.info('Bills - Recurrent bill successfully created', this.logDirectory)
    } catch (error) {
      this.logger.error(
        'Bills - Error creating recurrent bill : ' + error,
        this.logDirectory
      )
      return ErrorHandler.handle()
    }
  }
}
