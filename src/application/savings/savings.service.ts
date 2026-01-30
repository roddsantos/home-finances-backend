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
        `error creating saving : bankId : ${bankId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
    }
  }

  async update(id: string, payload: Omit<UpdateSavingDto, 'id'>) {
    try {
      const res = await this.savingRepository.update({ id }, payload)
      return res
    } catch (error) {
      this.logger.error(
        `error updating saving : id : ${id} : payload : ${objectToString(payload)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.savingRepository.delete(id)
      return res
    } catch (error) {
      this.logger.error(`error deleting saving : id : ${id}`, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
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
        `error fetcinhg savings by bank id : bankId : ${bankId}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
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
      this.logger.error(`error fetcinhg a saving id : id : ${id}`, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
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
        `error fetching an individual saving : bankId : ${bankId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
    }
  }

  async getSavingsProgression(
    userId: string,
    monthSpan: number,
    month?: number,
    year?: number
  ): Promise<any> {
    try {
      const piggyBanks = await this.bankService.getAllById(userId, true)

      const piggyBanksResume = []
      let previousMonthSaved = 0

      for (const index in piggyBanks) {
        const pbIndex = parseInt(index)
        const info = {
          bank: piggyBanks[pbIndex].name,
          color: piggyBanks[pbIndex].color,
          savings: piggyBanks[pbIndex].savings,
          progression: []
        }

        const progressionAux = []

        for (let i = monthSpan; i >= 0; i--) {
          const monthSaving = await this.savingRepository.findOne({
            where: {
              bankId: piggyBanks[pbIndex].id,
              month: (month || new Date().getMonth()) - i
            }
          })

          const savingDiff = (monthSaving?.total || 0) - previousMonthSaved

          progressionAux.push({
            savedValue: Boolean(monthSaving) ? savingDiff : 0,
            delta:
              !Boolean(progressionAux[monthSpan - 1 - i]) || !Boolean(previousMonthSaved)
                ? 0
                : convertToFloat((savingDiff / previousMonthSaved - 1) * 100),
            month: new Date(year, month - i, 1).getMonth(),
            year: new Date(year, month - i, 1).getFullYear()
          })
          previousMonthSaved = monthSaving ? monthSaving.total : 0
        }
        info.progression = progressionAux
        piggyBanksResume.push(info)
      }

      return piggyBanksResume.map((pbr) => ({
        ...pbr,
        progression: pbr.progression.slice(1, monthSpan + 1)
      }))
    } catch (error) {
      this.logger.error(
        `error fetching savings progress : userId : ${userId} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('error fetching savings progress')
    }
  }
}
