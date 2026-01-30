import { BankService } from 'src/application/bank/bank.service'
import { CreditCardService } from 'src/application/credit-card/credit-card.service'
import { Repository } from 'typeorm'
import { Bill } from '../bill.entity'
import * as path from 'path'
import { GeneralService } from 'src/application/app/general/service.general'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { CreditCard } from 'src/application/credit-card/credit-card.entity'
import { BillService } from '../bill.service'
import { GetBillService } from './get-bill.service'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BILL_MODULE } from 'src/application/core/consts/filename.consts'
import { CreateBillService } from './create-bill.service'
import {
  CreateBillTemplateDto,
  UpdateBillTemplateDto
} from 'src/application/core/types/bill'
import { convertToFloat } from 'src/application/utils/conversions'

@Injectable()
export class UpdateBillService extends GeneralService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly bankService: BankService,
    private readonly billService: BillService,
    private readonly getBillService: GetBillService,
    private readonly createBillService: CreateBillService,
    private readonly creditCardService: CreditCardService
  ) {
    super(path.join(__dirname, BILL_MODULE.updateBillService))
  }

  private getUpdatedCreditCard(
    creditCard: CreditCard,
    totalParcelDiff: number,
    data: UpdateBillTemplateDto,
    bill: Bill
  ) {
    const { limit, invoice } = creditCard
    const totalParcel = (data.totalParcel || bill.totalParcel) + totalParcelDiff

    const newCreditCardObject: CreditCard = {
      ...creditCard,
      limit: limit - totalParcel,
      invoice: invoice + totalParcel
    }
    return newCreditCardObject
  }

  async updateTransactionBill(data: UpdateBillTemplateDto) {
    const result = {
      banks: [],
      bill: null
    }
    try {
      const bill = await this.getBillService.getBillById(data.id)
      const { id, settled, bank1Id, bank2Id, total, isPayment, groupId, isRecurrent } =
        bill

      const newTotalDelta = data.total ? convertToFloat(data.total - total) : 0

      if (newTotalDelta === 0 || !settled) {
        await this.billRepository.update(id, { ...data })
        result.bill = { ...bill, ...data }
        return result
      }

      const bank1 = await this.bankService.getOneById(bank1Id)
      const resBank1 = await this.billService.updateBank(bank1, newTotalDelta, isPayment)
      result.banks.push(resBank1)

      if (bank2Id) {
        const bank2 = await this.bankService.getOneById(bank2Id)
        const resBank2 = await this.billService.updateBank(
          bank2,
          newTotalDelta,
          !isPayment
        )
        result.banks.push(resBank2)
      }

      if (isRecurrent && (data.settled || (data.settled && !settled))) {
        const createBillData = data as CreateBillTemplateDto
        this.createBillService.createRecurrentBill({
          ...createBillData,
          groupId: groupId || this.uuid.v4()
        })
      }

      await this.billRepository.update(id, { ...data })
      result.bill = { ...bill, ...data }

      return result
    } catch (error) {
      this.logger.error('error updating transaction bill : ' + error, this.logDirectory)
      ErrorHandler.handle(error)
    }
  }

  async updateCompanyBill(data: UpdateBillTemplateDto) {
    const result = {
      banks: [],
      creditCard: null,
      bill: null
    }

    try {
      const bill = await this.getBillService.getBillById(data.id)
      const {
        id,
        totalParcel,
        parcel,
        parcels,
        delta,
        taxes,
        settled,
        bank1Id,
        creditCardId,
        isPayment
      } = bill

      const newTotalDelta = data.totalParcel
        ? convertToFloat(data.totalParcel - totalParcel)
        : 0

      if (newTotalDelta === 0 || !settled) {
        await this.billRepository.update(id, { ...data })
        result.bill = { ...bill, ...data }
        return result
      }

      if (!bank1Id && !creditCardId) {
        this.logger.error('neither credit card nor bank were found', this.logDirectory)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
          'bills - neither credit card nor bank were found'
        )
      }

      const newDelta = parcel === parcels - 1 ? data.delta || delta : 0
      const newTaxes = data.taxes || taxes
      const totalParcelDiff = newTaxes + newDelta + newTotalDelta

      if (bank1Id) {
        const bank1 = await this.bankService.getOneById(bank1Id)
        const resBank1 = await this.billService.updateBank(
          bank1,
          totalParcelDiff,
          isPayment
        )
        result.banks.push(resBank1)
      }

      if (creditCardId) {
        const creditCard = await this.creditCardService.getOneById(creditCardId)
        const newCreditCardObject = this.getUpdatedCreditCard(
          creditCard,
          totalParcelDiff,
          data,
          bill
        )
        await this.creditCardService.update(creditCardId, newCreditCardObject)
        result.creditCard = newCreditCardObject
      }

      await this.billRepository.update(id, { ...data })
      result.bill = { ...bill, ...data }

      return result
    } catch (error) {
      this.logger.error('error updating company bill : ' + error, this.logDirectory)
      ErrorHandler.handle(error)
    }
  }

  async updateCreditCardBill(data: UpdateBillTemplateDto) {
    try {
      const bill = await this.getBillService.getBillById(data.id)
      const {
        total,
        taxes,
        delta,
        groupId,
        parcel,
        parcels,
        totalParcel,
        creditCardId,
        due,
        settled
      } = bill

      if (!groupId) {
        throw ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - group id not found')
      }
      const allBillsRelated = await this.billRepository.find({
        where: {
          groupId
        }
      })
      if (allBillsRelated.length === 0)
        throw ErrorHandler.NOT_FOUND_MESSAGE('Bill not found')
      const firstBill = allBillsRelated[0]

      let month = new Date(due).getMonth()
      const allPromises = await Promise.all(
        allBillsRelated.map((abr, i) => {
          const newDate = new Date(new Date(due).setMonth(month))
          const updateData = this.billRepository.update(abr.id, {
            ...data,
            parcel: abr.parcel,
            totalParcel:
              parseFloat(((total + taxes) / parcels).toFixed(2)) +
              (i === parcels - 1 ? delta : 0),
            paid: newDate.toISOString(),
            due: newDate.toISOString()
          })
          month = month + 1
          return updateData
        })
      )

      if (
        (firstBill.total !== total ||
          firstBill.taxes !== taxes ||
          firstBill.delta !== delta) &&
        parcel > 0
      )
        throw ErrorHandler.NOT_ACCEPTABLE(
          "Can't change bill value after first one is processed"
        )

      if (allPromises.length !== allBillsRelated.length)
        throw ErrorHandler.SOME_PROMISE_NOT_COMPLETED_MESSAGE(
          'One or more bills were not updated'
        )

      if (settled && !firstBill.settled) {
        const cc = await this.creditCardService.getOneById(creditCardId)
        if (cc) {
          const valueForLimit =
            parcel > 0
              ? total - (parcel * total + taxes + (parcels === parcel - 1 ? delta : 0))
              : total + taxes + delta
          const newCcObject: CreditCard = {
            ...cc,
            limit: cc.limit + valueForLimit * -1,
            invoice: cc.invoice + totalParcel * -1
          }
          await this.creditCardService.update(creditCardId, newCcObject)
        }
      }
      return {
        affected: allBillsRelated.map((abr) => abr.id)
      }
    } catch (error) {
      this.logger.error('error updating credit card bill : ' + error, this.logDirectory)
      ErrorHandler.handle(error)
    }
  }
}
