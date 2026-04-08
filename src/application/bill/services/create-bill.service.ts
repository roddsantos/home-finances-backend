import { GeneralService } from 'src/application/app/general/service.general'
import * as path from 'path'
import { Repository } from 'typeorm'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { BankService } from 'src/application/bank/bank.service'
import { BillService } from '../bill.service'
import { Bill } from '../bill.entity'
import { CreditCardService } from 'src/application/credit-card/credit-card.service'
import { CreditCard } from 'src/application/credit-card/credit-card.entity'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BILL_MODULE } from 'src/application/core/consts/filename.consts'
import { BillObjectType, CreateBillTemplateDto } from 'src/application/core/types/bill'
import { UpdateBillService } from './update-bill.service'

@Injectable()
export class CreateBillService extends GeneralService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly bankService: BankService,
    private readonly billService: BillService,
    @Inject(forwardRef(() => UpdateBillService))
    private readonly updateBillService: UpdateBillService,
    @Inject(forwardRef(() => CreditCardService))
    private readonly ccService: CreditCardService
  ) {
    super(path.join(__dirname, BILL_MODULE.createBillService))
  }

  async createTransactionBill(createTransactionBillDto: CreateBillTemplateDto) {
    const result = {
      banks: [],
      creditCard: null,
      bill: null
    }

    try {
      this.logger.info('creating transaction bill', this.logDirectory)
      const { total, bank1Id, bank2Id, isPayment, settled, isRecurrent } =
        createTransactionBillDto

      if (!settled) {
        result.bill = await this.billRepository.save({
          ...createTransactionBillDto,
          totalParcel: total
        })
        return result
      }

      const bank1 = await this.bankService.getOneById(bank1Id)
      const updatedBank1 = await this.billService.updateBank(bank1, total, isPayment)
      result.banks.push(updatedBank1)

      if (bank2Id) {
        const bank2 = await this.bankService.getOneById(bank2Id)
        const updatedBank2 = await this.billService.updateBank(bank2, total, !isPayment)
        result.banks.push(updatedBank2)
      }

      if (isRecurrent) {
        this.createRecurrentBill({ ...createTransactionBillDto })
      }

      result.bill = await this.billRepository.save({
        ...createTransactionBillDto,
        totalParcel: total
      })

      return result
    } catch (error) {
      this.logger.error('error creating transaction bill : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('bills - error creating transaction bill')
    }
  }

  async createCompanyCreditBill(createCompanyBillDto: CreateBillTemplateDto) {
    try {
      this.logger.info('creating company bill', this.logDirectory)

      const bills = this.billService.parcelsForBills(createCompanyBillDto)

      const allBills: BillObjectType[] = await Promise.all(
        bills.map((bill) => {
          const res = this.billRepository.save(bill)
          return res
        })
      )

      const result = {
        banks: [],
        creditCard: null,
        bill: allBills[0]
      }

      return result
    } catch (error) {
      this.logger.error('error creating company bill : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('bills - error creating company bill')
    }
  }

  async createCreditCardBill(createCreditCardBillDto: CreateBillTemplateDto) {
    try {
      const { creditCardId, total, taxes, delta } = createCreditCardBillDto
      const groupId = this.uuid.v4()

      const bills = this.billService.parcelsForBills(createCreditCardBillDto, true)

      const cc = await this.ccService.getValidCreditCard(creditCardId)
      if (!cc) {
        this.logger.warn(
          `cant find valid credit card with id : ${creditCardId}`,
          this.logDirectory
        )
        const oldCreditCard = await this.ccService.getOneById(creditCardId)
        const newCreditCardBill = await this.billService.getBillById(
          oldCreditCard.relatedBillId
        )
        const newCreditCard = await this.ccService.createCreditCardFromPrevious(
          oldCreditCard,
          newCreditCardBill
        )

        const bill = await this.billService.getBillById(newCreditCard.relatedBillId)
        await this.updateBillService.updateTransactionBill({
          id: bill.id,
          total: bill.total + bills[0].totalParcel,
          totalParcel: bill.totalParcel + bills[0].totalParcel
        })

        const allBills = await Promise.all(
          bills.map((b) => {
            const res = this.billRepository.save({
              ...b,
              creditCardId: newCreditCard.id,
              groupId
            })
            return res
          })
        )

        const result = {
          banks: [],
          creditCard: newCreditCard,
          bill: allBills[0]
        }

        return result
      } else {
        const newCcObject: CreditCard = {
          ...cc,
          limitLeft: cc.limitLeft + (total + taxes + delta) * -1,
          invoice: cc.invoice + bills[0].totalParcel
        }
        const creditCard = await this.ccService.update(cc.id, newCcObject)
        const bill = await this.billService.getBillById(creditCard.relatedBillId)
        await this.updateBillService.updateTransactionBill({
          id: bill.id,
          total: bill.total + bills[0].totalParcel,
          totalParcel: bill.totalParcel + bills[0].totalParcel
        })

        const allBills = await Promise.all(
          bills.map((b) => {
            const res = this.billRepository.save({ ...b, groupId })
            return res
          })
        )

        const result = {
          banks: [],
          creditCard,
          bill: allBills[0]
        }

        return result
      }
    } catch (error) {
      this.logger.error(`error creating credit card bill : ${error}`, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('bills - error creating credit card bill')
    }
  }

  async createRecurrentBill(data: CreateBillTemplateDto) {
    try {
      this.logger.info(
        `creating recurrent bill : payload: ${JSON.stringify(data)}`,
        this.logDirectory
      )
      const groupId = data.groupId || this.uuid.v4()
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

      const newDue = new Date(newYear, newMonth, newDay)

      await this.createTransactionBill({
        ...data,
        groupId,
        due: newDue,
        settled: false,
        paid: null
      })
    } catch (error) {
      this.logger.error('error creating recurrent bill : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('bills - error creating recurrent bill')
    }
  }
}
