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

@Injectable()
export class CreditCardService extends GeneralService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    @Inject(forwardRef(() => CreateBillService))
    private readonly createBillService: CreateBillService,
    @Inject(forwardRef(() => UpdateBillService))
    private readonly updateBillService: UpdateBillService
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
        limitLeft: createCreditCard.limit
      })

      await this.updateBillService.updateTransactionBill({
        id: bill.id,
        creditCardId: creditCard.id
      })

      this.logger.info(
        `category created succesfully with name : ${createCreditCard.name}  : id : ${creditCard.id}`,
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

  async getAllById(userId: string) {
    try {
      const res = await this.creditCardRepository.find({
        where: { userId },
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

  async getOneById(id: string) {
    try {
      const res = await this.creditCardRepository.findOne({
        where: { id }
      })
      return res
    } catch (error) {
      this.logger.error('Credit Card - error retrieving credit card', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('Credit Card - error retrieving credit card')
    }
  }

  async getBySearchTerm(searchTerm: string, userId: string) {
    if (!userId) {
      this.logger.error(`userId not found : userId : ${userId}`, this.logDirectory)
      ErrorHandler.BAD_REQUEST('banks - userId not found')
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
}
