import { Controller, Delete, Patch } from '@nestjs/common'
import { UserService } from './user.service'
import { Get } from '@nestjs/common'
import { Param } from '@nestjs/common'
import { User } from './user.entity'
import { Post } from '@nestjs/common'
import { Body } from '@nestjs/common'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Res } from '@nestjs/common'
import { Response } from 'express'
import { CreateUserDto } from './dto/create-user.dto'
import { ErrorHandler } from '../utils/ErrorHandler'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public async getUser(
    @Param('username') username,
    @Res() res: Response
  ): Promise<Response<User>> {
    try {
      const result = await this.userService.getOne(username)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post()
  public async createUser(
    @Body() data: CreateUserDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.name === '' || data.surname == '' || data.username === '')
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const result = await this.userService.create(data)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateUser(
    @Body() data: UpdateUserDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.name === '' || data.surname == '' || data.username === '' || data.id < 0)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const result = await this.userService.update(data)
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete()
  public async deleteUser(
    @Param('id') id: number,
    @Res() res: Response
  ): Promise<Response<boolean>> {
    try {
      await this.userService.delete(id)
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
