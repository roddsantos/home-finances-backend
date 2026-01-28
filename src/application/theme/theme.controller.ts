import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common'
import { ThemeBody, UpdateThemeBody } from '../core/types/theme'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Response } from 'express'
import { GeneralController } from '../app/general/controller.general'
import * as path from 'path'
import { THEME_MODULE } from '../core/consts/filename.consts'
import { ResponseHandler } from '../utils/ResponseHandler'
import { ThemeService } from './theme.service'
import { objectToString } from '../utils/conversions'

@Controller('theme')
export class ThemeController extends GeneralController {
  constructor(private readonly themeService: ThemeService) {
    super(path.join(__dirname, THEME_MODULE.controller))
  }

  @Post()
  public async createTheme(@Body() payload: ThemeBody, @Res() res: Response) {
    try {
      const result = await this.themeService.create(payload)

      this.logger.info(
        `theme successfully created : payload : ${objectToString(payload)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateTheme(@Body() payload: UpdateThemeBody, @Res() res: Response) {
    try {
      const result = await this.themeService.update(payload)

      this.logger.info(
        `theme successfully updated : payload : ${objectToString(payload)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/:id')
  public async getThemesByUserId(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.themeService.getAllByUserId(id)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteTheme(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.themeService.delete(id)

      this.logger.info(`theme deleted successfully : id : ${id}`, this.logDirectory)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      ErrorHandler.errorResponse(res, error)
    }
  }
}
