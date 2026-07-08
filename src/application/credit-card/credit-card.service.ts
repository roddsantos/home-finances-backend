import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { CreditCard } from './credit-card.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ILike, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import * as path from 'path'
import { CREDIT_CARD_MODULE } from '../core/consts/filename.consts'
import { GeneralService } from '../app/general/service.general'
import {
  CreateCreditCardTemplateDto,
  UpdateCreditCardTemplateDto
} from '../core/types/credit-card'
import { CreateBillTemplateDto } from '../core/types/bill'
import { CreateBillService } from '../bill/services/create-bill.service'
import { UpdateBillService } from '../bill/services/update-bill.service'
import { objectToString } from '../utils/conversions'
import { Bill } from '../bill/bill.entity'
import { QuickSettleBillService } from '../bill/services/quick-settle-bill.service'
import { BillService } from '../bill/bill.service'

@Injectable()
export class CreditCardService extends GeneralService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    @Inject(forwardRef(() => CreateBillService))
    private readonly createBillService: CreateBillService,
    @Inject(forwardRef(() => UpdateBillService))
    private readonly updateBillService: UpdateBillService,
    private readonly quickSettleBillService: QuickSettleBillService,
    @Inject(forwardRef(() => BillService))
    private readonly billService: BillService
  ) {
    super(path.join(__dirname, CREDIT_CARD_MODULE.service))
  }

  public getCreditCardBillPayload(
    userId: string,
    creditCard: CreateCreditCardTemplateDto
  ) {
    const year = creditCard.month === 11 ? creditCard.year + 1 : creditCard.year
    const month = creditCard.month === 11 ? 0 : creditCard.month + 1

    const payload: CreateBillTemplateDto = {
      groupId: this.uuid.v4(),
      name: `${creditCard.name} invoice`,
      description: `${creditCard.name} - ${creditCard.month + 1}/${creditCard.year} invoice`,
      total: 0,
      totalParcel: 0,
      settled: false,
      parcels: 0,
      parcel: 1,
      taxes: 0,
      delta: 0,
      due: new Date(year, month, creditCard.due),
      paid: null,
      type: 'money',
      companyId: null,
      categoryId: creditCard.categoryId,
      bank1Id: creditCard.bank1Id,
      bank2Id: null,
      isRecurrent: false,
      creditCardId: null,
      isPayment: true,
      userId
    }

    return payload
  }

  async createNewCreditCard(
    userId: string,
    createCreditCard: CreateCreditCardTemplateDto
  ) {
    try {
      const cc = await this.creditCardRepository.findOne({
        where: {
          userId,
          name: createCreditCard.name,
          month: createCreditCard.month,
          year: createCreditCard.year
        }
      })
      if (cc) {
        this.logger.error('this credit card already exists', this.logDirectory)
        ErrorHandler.CONFLICT_MESSAGE('credit card - this credit card already exists')
      }

      const payload = this.getCreditCardBillPayload(userId, createCreditCard)

      const { bill } = await this.createBillService.createTransactionBill(payload)

      const creditCard = await this.creditCardRepository.save({
        ...createCreditCard,
        relatedBillId: bill.id,
        userId,
        limitLeft: createCreditCard?.limitLeft || createCreditCard.limit,
        groupId: this.uuid.v4()
      })

      await this.updateBillService.updateTransactionBill({
        id: bill.id,
        creditCardId: creditCard.id,
        total: createCreditCard.invoice,
        totalParcel: createCreditCard.invoice
      })

      this.logger.info(
        `credit card created succesfully with name : ${createCreditCard.name}  : id : ${creditCard.id}`,
        this.logDirectory
      )
      return creditCard
    } catch (error) {
      this.logger.error(
        `error creating credit card : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('credit card - error creating credit card')
    }
  }

  async update(id: string, data: Partial<Omit<UpdateCreditCardTemplateDto, 'id'>>) {
    try {
      const cc = await this.getOneById(id)

      await this.creditCardRepository.update({ id }, data)

      return { ...cc, ...data }
    } catch (error) {
      this.logger.error('error updating credit card', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('credit card - error uppdating credit card')
    }
  }

  async delete(id: string) {
    try {
      const res = await this.creditCardRepository.delete(id)
      return res
    } catch (error) {
      this.logger.error('Credit Card - error deleting credit card', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('credit card - error deleting credit card')
    }
  }

  async getAllByUserId(userId: string) {
    try {
      const res = await this.creditCardRepository.find({
        where: { userId, isClosed: false },
        order: { updatedAt: 'DESC' }
      })
      return res
    } catch (error) {
      this.logger.error('error retrieving all credit cards by id', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR(
        'credit card - error retrieving all credit cards by id'
      )
    }
  }

  async getValidCreditCard(creditCardId: string) {
    try {
      const creditCard = await this.getOneById(creditCardId)
      const today = new Date()

      const isValidCreditCard =
        (creditCard.day > today.getDate() && creditCard.month === today.getMonth() - 1) ||
        (creditCard.day <= today.getDate() && creditCard.month === today.getMonth())

      if (isValidCreditCard) {
        return creditCard
      }
      const validCreditCard = await this.getCreditCardByNameMonthAndYear(
        today.getMonth(),
        today.getFullYear(),
        creditCard.name,
        creditCard.userId
      )

      if (!validCreditCard) return null

      return validCreditCard
    } catch (error) {
      this.logger.error(
        `error retrieving valid credit card : creditCardId : ${creditCardId} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR(
        'credit card - error retrieving valid credit card'
      )
    }
  }

  async getCreditCardByNameMonthAndYear(
    month: number,
    year: number,
    name: string,
    userId: string
  ) {
    try {
      const creditCard = await this.creditCardRepository.findOne({
        where: {
          month,
          year,
          name,
          userId
        }
      })
      return creditCard
    } catch (error) {
      this.logger.error(
        `error retrieving credit card by month : ${month} : year :` +
          ` ${year} : name : ${name} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR(
        'credit card - error retrieving credit card by month'
      )
    }
  }

  async getOneById(id: string) {
    try {
      const res = await this.creditCardRepository.findOne({
        where: { id }
      })
      return res
    } catch (error) {
      this.logger.error('error retrieving credit card', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('credit card - error retrieving credit card')
    }
  }

  async getBySearchTerm(searchTerm: string, userId: string) {
    if (!userId) {
      this.logger.error(`userId not found : userId : ${userId}`, this.logDirectory)
      ErrorHandler.BAD_REQUEST('credit card - userId not found')
    }
    if (!searchTerm) {
      return []
    }

    try {
      const searchResult = await this.creditCardRepository.find({
        select: { id: true, name: true, description: true },
        where: { name: ILike(`%${searchTerm}%`), userId }
      })
      return searchResult.map((creditCard) => ({
        id: creditCard.id,
        description: creditCard.description,
        title: creditCard.name,
        type: 'credit-card',
        date: null,
        value: creditCard.invoice
      }))
    } catch (error) {
      this.logger.error(
        `error retrieving credit cards by search term : searchTerm : ${searchTerm} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.NOT_FOUND_MESSAGE(
        'credit cards - error retrieving credit cards by search term'
      )
    }
  }

  async createCreditCardFromPrevious(creditCard: CreditCard, bill: Bill) {
    try {
      const { name, description, color, flag, limit, day, due, groupId } = creditCard
      const { categoryId, bank1Id } = bill
      const newDate = new Date(creditCard.year, creditCard.month + 1, creditCard.day)

      const { bills, invoice, limitUsed } =
        await this.billService.getCreditCardBillsFromNextMonths(
          creditCard.userId,
          day,
          newDate.getMonth(),
          newDate.getFullYear(),
          creditCard.groupId
        )

      const payload = {
        name,
        groupId,
        description,
        color,
        flag,
        limit,
        day,
        due,
        month: newDate.getMonth(),
        year: newDate.getFullYear(),
        isClosed: false,
        categoryId,
        bank1Id,
        relatedBillId: null,
        invoice,
        limitLeft: limit - limitUsed
      }

      const newCreditCard = await this.createNewCreditCard(creditCard.userId, payload)

      for (const b of bills) {
        await this.updateBillService.updateCreditCardBill({
          id: b.id,
          creditCardId: newCreditCard.id
        })
      }

      return newCreditCard
    } catch (error) {
      this.logger.error(
        `error creating credit card from previous creditCard :` +
          ` creditCardId : ${creditCard.id} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.NOT_FOUND_MESSAGE(
        'credit cards - error creating credit card from previous creditCard'
      )
    }
  }

  async closeCreditCard(creditCardId: string) {
    try {
      const creditCard = await this.getOneById(creditCardId)
      const bill = await this.billService.getBillById(creditCard.relatedBillId)

      await this.update(creditCardId, { isClosed: true })

      const existingCreditCard = await this.getCreditCardByNameMonthAndYear(
        creditCard.month + 1,
        creditCard.year,
        creditCard.name,
        creditCard.userId
      )
      if (existingCreditCard) {
        return null
      }
      const newCreditCard = await this.createCreditCardFromPrevious(creditCard, bill)
      return newCreditCard
    } catch (error) {
      this.logger.error(
        `error closing credit card :` +
          ` creditCardID : ${creditCardId} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.NOT_FOUND_MESSAGE('credit cards - error closing credit card')
    }
  }

  async getCreditCardsFromGroupId(groupId: string, options?: any) {
    try {
      const creditCards = await this.creditCardRepository.find({
        where: { groupId, ...options }
      })

      return creditCards
    } catch (error) {
      this.logger.error(
        `error fetching credit card from groupId :` +
          ` groupId : ${groupId} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.NOT_FOUND_MESSAGE(
        'credit cards - error fetching credit card from groupId'
      )
    }
  }
}
