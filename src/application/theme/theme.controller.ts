import { Body, Controller, Delete, Get, Patch, Post, Res } from '@nestjs/common'
import { ThemeBody } from '../core/types/theme'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Response } from 'express'
import { GeneralController } from '../app/general/controller.general'
import * as path from 'path'
import { THEME_MODULE } from '../core/consts/filename.consts'
import { ResponseHandler } from '../utils/ResponseHandler'
import { ThemeService } from './theme.service'

@Controller('theme')
export class ThemeController extends GeneralController {
  constructor(private readonly themeService: ThemeService) {
    super(path.join(__dirname, THEME_MODULE.controller))
  }

  @Post()
  public async createTheme(@Body() data: ThemeBody, @Res() res: Response) {
    try {
      const result = await this.themeService.create(data)

      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      this.logger.error(
        this.logDirectory + ' Bills - Unable to generate bills data : ' + error
      )
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  updateTheme() {}

  @Get()
  getThemesById() {}

  @Delete()
  deleteTheme() {}
}
