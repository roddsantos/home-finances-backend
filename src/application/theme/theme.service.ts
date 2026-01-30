import { Injectable } from '@nestjs/common'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'
import { THEME_MODULE } from '../core/consts/filename.consts'
import { ThemeBody, UpdateThemeBody } from '../core/types/theme'
import { InjectRepository } from '@nestjs/typeorm'
import { Theme } from './theme.entity'
import { Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { objectToString } from '../utils/conversions'

@Injectable()
export class ThemeService extends GeneralService {
  constructor(
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>
  ) {
    super(path.join(__dirname, THEME_MODULE.service))
  }

  async getAllByUserId(userId: string) {
    try {
      const result = await this.themeRepository.find({
        where: { userId }
      })

      return result
    } catch (error) {
      this.logger.error(
        `error fetching themes by userId : ${userId} : ` + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('theme - error fetching themes by userId')
    }
  }

  async create(payload: ThemeBody) {
    try {
      const result = await this.themeRepository.save(payload)

      return result
    } catch (error) {
      this.logger.error(
        `error creating theme : payload : ${objectToString(payload)} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('theme - error creating theme')
    }
  }

  async update(payload: UpdateThemeBody) {
    try {
      const { id, ...data } = payload

      const theme = await this.getThemeById(id)
      await this.themeRepository.update({ id }, data)

      return { ...theme, ...payload }
    } catch (error) {
      this.logger.error(
        `error updating theme : payload : ${objectToString(payload)} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('theme - error updating theme')
    }
  }

  async delete(id: string) {
    try {
      await this.themeRepository.delete({ id })

      return id
    } catch (error) {
      this.logger.error(
        `error deleting theme : id : ${id} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('theme - error deleting theme')
    }
  }

  async getThemeById(id: string) {
    try {
      this.logger.info(`retrieving theme data : id : ${id}`, this.logDirectory)
      const theme = await this.themeRepository.findOneBy({ id })

      if (!theme) {
        this.logger.error(`theme not found : id : ${id}`, this.logDirectory)
        ErrorHandler.NOT_FOUND_MESSAGE('themes - theme not found')
      }
      return theme
    } catch (error) {
      this.logger.error(
        `error fetching theme : id : ${id} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('themes - error retrieving theme')
    }
  }
}
