import { Injectable } from '@nestjs/common'
import { NewSavingDto, UpdateSavingDto } from './savings.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Savings } from './savings.entity'
import { Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { BankService } from '../bank/bank.service'
import { convertToFloat, objectToString } from '../utils/conversions'
import * as path from 'path'
import { GeneralService } from '../app/general/service.general'
import { SAVING_MODULE } from '../core/consts/filename.consts'

@Injectable()
export class SavingsService extends GeneralService {
  constructor(
    @InjectRepository(Savings)
    private readonly savingRepository: Repository<Savings>,
    private readonly bankService: BankService
  ) {
    super(path.join(__dirname, SAVING_MODULE.service))
  }

  async create(newMonthlySavingDto: NewSavingDto) {
    const { type, bankId, month, year } = newMonthlySavingDto

    try {
      const saving = await this.savingRepository.findOne({
        where: {
          type,
          bankId,
          month,
          year
        }
      })
      if (saving) {
        this.logger.error(
          `a saving with these parameters already exists : bankId : ${bankId} : month ${month} : year : ${year}`,
          this.logDirectory
        )
        ErrorHandler.CONFLICT_MESSAGE(
          'savings - a saving with these parameters already exists'
        )
      }
      const res = await this.savingRepository.save(newMonthlySavingDto)
      return res
    } catch (error) {
      this.logger.error(
        `error creating saving : bankId : ${bankId} : month ${month} : year : ${year} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('savings - error creating saving')
    }
  }

  async bulkSaving(userId: string, month: number, year: number) {
    const savingsPromises = []
    try {
      const allBanks = await this.bankService.getAllById(userId)

      allBanks.forEach(async (bank) => {
        const saving = await this.savingRepository.findOne({
          where: {
            type: 'start',
            bankId: bank.id,
            month,
            year
          }
        })
        if (!saving) {
          savingsPromises.push(
            await this.savingRepository.save({
              bankId: bank.id,
              total: bank.savings,
              month,
              year,
              type: 'start'
            })
          )
        }
      })

      const results = await Promise.allSettled(savingsPromises)
      return results
    } catch (error) {
      this.logger.error(
        `error creating multiples savings : userId : ${userId} : month ${month} : year : ${year} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('savings - error creating multiples savings')
    }
  }

  async update(id: string, payload: Omit<UpdateSavingDto, 'id'>) {
    try {
      const res = await this.savingRepository.update({ id }, payload)
      return res
    } catch (error) {
      this.logger.error(
        `error updating saving : id : ${id} : payload : ${objectToString(payload)} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('savings - error updating saving')
    }
  }

  async delete(id: string) {
    try {
      const res = await this.savingRepository.delete(id)
      return res
    } catch (error) {
      this.logger.error(
        `error deleting saving : id : ${id} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('savings - error deleting saving')
    }
  }

  async getAllByBankId(bankId: string, pages: number, take?: number) {
    try {
      const [data, total] = await this.savingRepository.findAndCount({
        where: { bankId },
        take: pages * (take || 4),
        order: { updatedAt: 'DESC' }
      })
      return {
        count: total,
        data
      }
    } catch (error) {
      this.logger.error(
        `error fetcinhg savings by bank id : bankId : ${bankId} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('savings - error fetching savings by bank id')
    }
  }

  async getOneById(id: string) {
    try {
      const res = await this.savingRepository.findOne({
        where: { id },
        order: { updatedAt: 'DESC' }
      })
      return res
    } catch (error) {
      this.logger.error(
        `error fetcinhg a saving id : id : ${id} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('savings - error fetching a saving id')
    }
  }

  /**
   * Fetch a specific saving refering a month and year
   * @param {string} bankId id of the bank
   * @param {number} month refered month
   * @param {number} year refered year
   * @returns {Savings | null} found saving
   */
  async getOneByBankId(
    bankId: string,
    month?: number,
    year?: number
  ): Promise<Savings | null> {
    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()
    try {
      const res = await this.savingRepository.findOne({
        where: { bankId, month: monthRef, year: yearRef },
        order: { updatedAt: 'DESC' }
      })
      return res
    } catch (error) {
      this.logger.error(
        `error fetching an individual saving : bankId : ${bankId} : month ${month} : year : ${year} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('savings - error fetching an individual saving')
    }
  }

  async getSavingsProgression(
    userId: string,
    monthSpan: number,
    month?: number,
    year?: number
  ) {
    try {
      const piggyBanks = await this.bankService.getAllById(userId, true)

      const now = new Date()
      const targetMonth = month ?? now.getMonth()
      const targetYear = year ?? now.getFullYear()

      const piggyBanksResume = []

      for (const piggyBank of piggyBanks) {
        let previousMonthSaved = 0

        const progression = []

        for (let i = monthSpan; i >= 0; i--) {
          const date = new Date(targetYear, targetMonth - i, 1)

          const monthSaving = await this.savingRepository.findOne({
            where: {
              bankId: piggyBank.id,
              month: date.getMonth(),
              year: date.getFullYear()
            }
          })

          const currentMonthSaved = monthSaving?.total ?? 0

          const savingDiff = currentMonthSaved - previousMonthSaved

          const hasPreviousMonth = progression.length > 0

          const delta =
            hasPreviousMonth && previousMonthSaved !== 0
              ? convertToFloat((savingDiff / previousMonthSaved) * 100)
              : 0

          progression.push({
            savedValue: monthSaving ? savingDiff : 0,
            delta,
            month: date.getMonth(),
            year: date.getFullYear()
          })

          previousMonthSaved = currentMonthSaved
        }

        piggyBanksResume.push({
          bank: piggyBank.name,
          color: piggyBank.color,
          savings: piggyBank.savings,
          progression: progression.slice(1)
        })
      }

      return piggyBanksResume
    } catch (error) {
      this.logger.error(
        `error fetching savings progress : userId : ${userId} : error : ${error}`,
        this.logDirectory
      )

      throw ErrorHandler.INTERNAL_SERVER_ERROR('error fetching savings progress')
    }
  }
}
