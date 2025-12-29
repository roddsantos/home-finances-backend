import { Injectable } from '@nestjs/common'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'
import { THEME_MODULE } from '../core/consts/filename.consts'
import { ThemeBody } from '../core/types/theme'
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
        `Theme - Error fetching themes by userId ${userId} : ` + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('Theme - Error fetching themes by userId')
    }
  }

  async create(body: ThemeBody) {
    try {
      const result = await this.themeRepository.save(body)
      this.logger.info(
        `- Theme - theme saved into database : id : ${result.id}`,
        this.logDirectory
      )

      return result
    } catch (error) {
      this.logger.error('Theme - Error creating theme : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('Theme - Error creating theme')
    }
  }
}
