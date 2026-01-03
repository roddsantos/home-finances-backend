import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common'
import { ThemeBody, UpdateThemeBody } from '../core/types/theme'
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
      this.logger.error('theme - error creating theme : ' + error, this.logDirectory)
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateTheme(@Body() data: UpdateThemeBody, @Res() res: Response) {
    try {
      const result = await this.themeService.update(data)

      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      this.logger.error('theme - error updating theme : ' + error, this.logDirectory)
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/:id')
  public async getThemesByUserId(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.themeService.getAllByUserId(id)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      this.logger.error(
        'theme - error fetching themes by userId : ' + error,
        this.logDirectory
      )
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteTheme(@Param('id') id: string, @Res() res: Response) {
    const result = await this.themeService.delete(id)
    return ResponseHandler.sendResponse(result, res)
  }
}
