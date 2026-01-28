import { Controller, Param, Body, Res } from '@nestjs/common'
import { UserService } from './user.service'
import { Get, Post, Delete, Patch } from '@nestjs/common'
import { User } from './user.entity'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import { GeneralController } from '../app/general/controller.general'
import { USER_MODULE } from '../core/consts/filename.consts'
import * as path from 'path'
import {
  CreateUserTemplateDto,
  UpdatePasswordTemplateDto,
  UpdateUserTemplateDto
} from '../core/types/user'
import { objectToString } from '../utils/conversions'

@Controller('user')
export class UserController extends GeneralController {
  constructor(private readonly userService: UserService) {
    super(path.join(__dirname, USER_MODULE.controller))
  }

  @Get('/:username')
  public async getUser(
    @Param('username') username,
    @Res() res: Response
  ): Promise<Response<User>> {
    try {
      if (username === '') ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing username')
      const result = await this.userService.getOneByUsername(username)

      this.logger.info(
        `user successfully retrieved : id : ${result.id}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post()
  public async createUser(
    @Body() data: CreateUserTemplateDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.name === '' || data.surname == '' || data.username === '')
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const result = await this.userService.create(data)
      this.logger.info(`user saved into database : id : ${result.id}`, this.logDirectory)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateUser(
    @Body() data: UpdateUserTemplateDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (
        data.name === '' ||
        data.surname == '' ||
        data.username === '' ||
        data.id === ''
      )
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const result = await this.userService.update(data)
      this.logger.info(
        `user updated successfully : id : ${result.id} : payload : ${objectToString(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteUser(
    @Param('id') id: number,
    @Res() res: Response
  ): Promise<Response<boolean>> {
    try {
      await this.userService.delete(id)
      this.logger.info(`user updated successfully : id : ${id}`, this.logDirectory)
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/password')
  public async updatePassword(
    @Body() data: UpdatePasswordTemplateDto,
    @Res() res: Response
  ) {
    try {
      this.userService.updatePassword(data)
      this.logger.info(
        `password updated successfully : id : ${data.id}`,
        this.logDirectory
      )
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
