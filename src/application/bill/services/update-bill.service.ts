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
import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common'
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
    @Inject(forwardRef(() => CreditCardService))
    private readonly creditCardService: CreditCardService
  ) {
    super(path.join(__dirname, BILL_MODULE.updateBillService))
  }

  private async getUpdatedCreditCard(
    creditCard: CreditCard,
    totalParcelDiff: number,
    data: UpdateBillTemplateDto,
    bill: Bill
  ) {
    const { limitLeft, invoice } = creditCard
    const totalParcel = (data.totalParcel || bill.totalParcel) + totalParcelDiff

    const newCreditCardObject: CreditCard = {
      ...creditCard,
      limitLeft: limitLeft - totalParcel,
      invoice: invoice + totalParcel
    }

    await this.creditCardService.update(creditCard.id, newCreditCardObject)

    return newCreditCardObject
  }

  async updateTransactionBill(data: UpdateBillTemplateDto) {
    const result = {
      banks: [],
      bill: null,
      creditCard: null
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
      ErrorHandler.handle(error as HttpException)
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
        const newCreditCardObject = await this.getUpdatedCreditCard(
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
      ErrorHandler.handle(error as HttpException)
    }
  }

  async updateCreditCardBill(data: UpdateBillTemplateDto) {
    const result = {
      banks: [],
      creditCard: null,
      bill: null
    }

    try {
      const bill = await this.getBillService.getBillById(data.id)
      const { id, taxes, delta, parcel, parcels, totalParcel, creditCardId, settled } =
        bill

      const newTotalDelta = data.totalParcel
        ? convertToFloat(data.totalParcel - totalParcel)
        : 0

      if (newTotalDelta === 0 || !settled) {
        await this.billRepository.update(id, { ...data })
        result.bill = { ...bill, ...data }
        return result
      }

      if (!creditCardId) {
        this.logger.error('missing creditCardId', this.logDirectory)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing creditCardId')
      }

      const newDelta = parcel === parcels - 1 ? data.delta || delta : 0
      const newTaxes = data.taxes || taxes
      const totalParcelDiff = newTaxes + newDelta + newTotalDelta

      const creditCard = await this.creditCardService.getOneById(creditCardId)
      const newCreditCardObject = await this.getUpdatedCreditCard(
        creditCard,
        totalParcelDiff,
        data,
        bill
      )
      result.creditCard = newCreditCardObject

      await this.billRepository.update(id, { ...data })
      result.bill = { ...bill, ...data }

      return result
    } catch (error) {
      this.logger.error('error updating credit card bill : ' + error, this.logDirectory)
      ErrorHandler.handle(error as HttpException)
    }
  }
}
