import { Injectable } from '@nestjs/common'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'
import { THEME_MODULE } from '../core/consts/filename.consts'
import { ThemeBody, UpdateThemeBody } from '../core/types/theme'
import { InjectRepository } from '@nestjs/typeorm'
import { Theme } from './theme.entity'
import { Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'

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
        `theme - error fetching themes by userId : ${userId} : ` + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('theme - error fetching themes by userId')
    }
  }

  async create(body: ThemeBody) {
    try {
      const result = await this.themeRepository.save(body)
      this.logger.info(
        `theme - theme saved into database : id : ${result.id}`,
        this.logDirectory
      )

      return result
    } catch (error) {
      this.logger.error('theme - error creating theme : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('theme - error creating theme')
    }
  }

  async update(body: UpdateThemeBody) {
    try {
      const { id, ...data } = body
      await this.themeRepository.update({ id }, data)
      this.logger.info(
        `theme - theme updated into database : id : ${id}`,
        this.logDirectory
      )

      return body
    } catch (error) {
      this.logger.error('theme - error updating theme : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('theme - error updating theme')
    }
  }

  async delete(id: string) {
    try {
      await this.themeRepository.delete({ id })

      this.logger.info(
        `theme - theme deleted successfully : id : ${id}`,
        this.logDirectory
      )

      return id
    } catch (error) {
      this.logger.error('theme - error deleting theme : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('theme - error deleting theme')
    }
  }
}
