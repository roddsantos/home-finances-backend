import { Injectable } from '@nestjs/common'
import { NewSavingDto, UpdateSavingDto } from './savings.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Savings } from './savings.entity'
import { Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { DashboardSavingsPerMonthType, DashboardSavingType } from '../types/dashboard'
import { BankService } from '../bank/bank.service'
import { convertToFloat } from '../utils/conversions'

@Injectable()
export class SavingsService {
  constructor(
    @InjectRepository(Savings)
    private readonly savingRepository: Repository<Savings>,
    private readonly bankService: BankService
  ) {}

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
      if (saving)
        ErrorHandler.CONFLICT_MESSAGE('A saving with these parameters already exists')

      const res = await this.savingRepository.save(newMonthlySavingDto)
      return res
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
    }
  }

  async update(id: string, data: Omit<UpdateSavingDto, 'id'>) {
    try {
      const res = await this.savingRepository.update({ id }, data)
      return res
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.savingRepository.delete(id)
      return res
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
    }
  }

  async getAllByBankId(bankId: string, pages: number, take?: number) {
    try {
      const [data, total] = await this.savingRepository.findAndCount({
        where: { bankId },
        take: pages * (take || 4)
      })
      return {
        count: total,
        data
      }
    } catch (error) {
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
      throw error
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

      const piggyBanksResume = new Array<DashboardSavingType>(piggyBanks.length).fill({
        bank: '',
        color: '',
        total: 0,
        progression: new Array<DashboardSavingsPerMonthType>(monthSpan + 1).fill({
          savedValue: 0,
          delta: 0,
          month: 0,
          year: 0
        })
      })

      for (const pbIndex in piggyBanks) {
        piggyBanksResume[pbIndex].bank = piggyBanks[pbIndex].name
        piggyBanksResume[pbIndex].color = piggyBanks[pbIndex].color
        piggyBanksResume[pbIndex].total = piggyBanks[pbIndex].savings

        for (let i = monthSpan; i >= 0; i--) {
          const monthSaving = await this.savingRepository.findOne({
            where: {
              bankId: piggyBanks[pbIndex].id,
              month: (month || new Date().getMonth()) - i
            }
          })
          const previousMonthSaved =
            piggyBanksResume[pbIndex].progression[monthSpan - 1 - i]?.savedValue || 0
          const savingDiff = (monthSaving?.total || 0) - previousMonthSaved

          piggyBanksResume[pbIndex].progression[monthSpan - i] = {
            savedValue: Boolean(monthSaving) ? savingDiff : 0,
            delta:
              !Boolean(piggyBanksResume[pbIndex].progression[monthSpan - 1 - i]) ||
              !Boolean(previousMonthSaved)
                ? 0
                : convertToFloat((savingDiff / previousMonthSaved - 1) * 100),
            month: new Date(year, month - i, 1).getMonth(),
            year: new Date(year, month - i, 1).getFullYear()
          }
        }
      }

      return piggyBanksResume.map((pbr) => ({
        ...pbr,
        progression: pbr.progression.slice(1, monthSpan + 1)
      }))
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR('Error getting savings progression')
    }
  }
}
