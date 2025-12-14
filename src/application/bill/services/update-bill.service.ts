import { Bank } from 'src/application/bank/bank.entity'
import { BankService } from 'src/application/bank/bank.service'
import { CreditCardService } from 'src/application/credit-card/credit-card.service'
import {
  UpdateBillBank,
  UpdateBillCompany,
  UpdateBillCreditCard
} from '../dto/update-bill.dto'
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

@Injectable()
export class UpdateBillService extends GeneralService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly bankService: BankService,
    private readonly billService: BillService,
    private readonly getBillService: GetBillService,
    private readonly ccService: CreditCardService
  ) {
    super(path.join(__dirname, '../../logs'))
  }

  async updateTransactionBill(id: string, data: Omit<UpdateBillBank, 'id'>) {
    const isQuickSettle = id && data.settled && !data.bank1Id

    try {
      const { settled, bank1Id, bank2Id, total, isPayment } = data

      const bill = await this.getBillService.getBillById(id)

      const newTotalDelta = isQuickSettle
        ? bill.total
        : !bill.settled
          ? total
          : parseFloat((total - bill.total).toFixed(2))

      if (!(settled && newTotalDelta !== 0)) {
        return await this.billRepository.update(id, { ...data })
      }

      const bank1 = await this.bankService.getOneById(bank1Id)
      this.billService.updateBank(bank1, newTotalDelta, isPayment)

      if (bank2Id) {
        const bank2 = await this.bankService.getOneById(bank2Id)
        this.billService.updateBank(bank2, newTotalDelta, !isPayment)
      }

      return await this.billRepository.update(id, { ...data })
    } catch (error) {
      this.logger.error(
        this.logDirectory + ' Bills - Error updating transaction bill : ' + error
      )
      ErrorHandler.handle()
    }
  }

  async updateCompanyBill(id: string, data: Partial<Omit<UpdateBillCompany, 'id'>>) {
    const isQuickSettle = id && data.settled && !data.companyId

    try {
      const bill = await this.getBillService.getBillById(id)

      const newDelta = bill.parcel === bill.parcels - 1 ? data.delta - bill.delta : 0
      const newTotalParcel =
        data.taxes !== undefined
          ? bill.totalParcel + (data.taxes - bill.taxes) + newDelta
          : bill.totalParcel

      const bank1Id = isQuickSettle ? bill.bank1Id : data.bank1Id
      const creditCardId = isQuickSettle ? bill.creditCardId : data.creditCardId
      const { totalParcel, parcels, total } = bill

      if (data.settled) {
        if (bank1Id) {
          const bank = await this.bankService.getOneById(bank1Id)
          const quickSettleSaving = bank.savings - (parcels > 1 ? newTotalParcel : total)
          const notQuickSettleSaving = bank.savings - newTotalParcel
          const savings = isQuickSettle ? quickSettleSaving : notQuickSettleSaving
          const newBankValue: Bank = {
            ...bank,
            id: bank1Id,
            savings
          }
          await this.bankService.update(bank1Id, newBankValue)
        } else if (creditCardId) {
          const cc = await this.ccService.getOneById(creditCardId)
          if (!cc) ErrorHandler.NOT_FOUND_MESSAGE('Credit card not found')
          else {
            const calculatedParcels = parcels > 1 ? totalParcel : total
            const calculatedDataParcels = data.parcels > 1 ? data.totalParcel : data.total
            const calculatedValue = isQuickSettle
              ? calculatedParcels
              : calculatedDataParcels
            const newCcObject: CreditCard = {
              ...cc,
              limit: cc.limit - calculatedValue,
              invoice: cc.invoice + calculatedValue
            }
            await this.ccService.update(creditCardId, newCcObject)
          }
        } else {
          this.logger.error(
            this.logDirectory + ' Bills - Neither credit card nor bank were found'
          )
          ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
            'Bills - Neither credit card nor bank were found'
          )
        }
      }

      const res = await this.billRepository.update(id, {
        ...data,
        paid: data.settled ? data.paid || new Date() : null,
        totalParcel: newTotalParcel
      })
      return res
    } catch (error) {
      this.logger.error(
        this.logDirectory + ' Bills - Error updating company bill : ' + error
      )
      return ErrorHandler.handle()
    }
  }

  async updateCreditCardBill(id: string, data: Omit<UpdateBillCreditCard, 'id'>) {
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
    } = data

    try {
      if (!groupId) throw ErrorHandler.NOT_FOUND_MESSAGE('Group id not found')
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
        const cc = await this.ccService.getOneById(creditCardId, {
          isClosed: false
        })
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
          await this.ccService.update(creditCardId, newCcObject)
        }
      }
      return {
        affected: allBillsRelated.map((abr) => abr.id)
      }
    } catch (error) {
      this.logger.error(
        this.logDirectory + ' Bills - Error updating credit card bill : ' + error
      )
      ErrorHandler.handle(error)
    }
  }
}
