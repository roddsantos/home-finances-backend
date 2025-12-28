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

  async create(body: ThemeBody) {
    try {
      const result = await this.themeRepository.save(body)
      this.logger.info(
        this.logDirectory + ` - Theme - theme saved into database : id : ${result.id}`
      )

      return result
    } catch (error) {
      this.logger.error(this.logDirectory + ' - Theme - Error creating theme : ' + error)
      ErrorHandler.INTERNAL_SERVER_ERROR('Theme - Error creating theme')
    }
  }
}
