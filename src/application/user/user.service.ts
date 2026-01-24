import { Injectable } from '@nestjs/common'
import { User } from './user.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'
import * as bcrypt from 'bcryptjs'
import { USER_MODULE } from '../core/consts/filename.consts'
import {
  CreateUserTemplateDto,
  UpdatePasswordTemplateDto,
  UpdateUserTemplateDto
} from '../core/types/user'
import { objectToString } from '../utils/conversions'

@Injectable()
export class UserService extends GeneralService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    super(path.join(__dirname, USER_MODULE.service))
  }

  async create(data: CreateUserTemplateDto) {
    try {
      const result = await this.userRepository.create(data)
      return result
    } catch (error) {
      this.logger.error(
        `error creating user : payload : ${objectToString(data)}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async update(data: UpdateUserTemplateDto) {
    try {
      const { id, ...rest } = data
      const user = await this.getOneById(id)

      await this.userRepository.update({ id }, rest)
      return { ...user, ...rest }
    } catch (error) {
      this.logger.error(
        `error updating user : id : ${data.id} : payload : ${objectToString(data)}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async updatePassword(data: UpdatePasswordTemplateDto) {
    try {
      const { id, newPassword } = data
      await this.getOneById(id)

      const newEncriptedPassword = await await bcrypt.hash(newPassword, 10)
      const payload = { password: newEncriptedPassword }

      await this.userRepository.update({ id }, payload)
      return { id }
    } catch (error) {
      this.logger.error(
        `error updating password : payload : ${objectToString(data)}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async delete(id: number) {
    try {
      await this.userRepository.delete(id)
      return id
    } catch (error) {
      this.logger.error(`error deleting user : id : ${id}`, this.logDirectory)
      ErrorHandler.handle(error)
    }
  }

  async getOneByUsername(username: string) {
    try {
      const res = await this.userRepository.findOne({ where: { username } })
      return res
    } catch (error) {
      this.logger.error(`error fetching user : username : ${username}`, this.logDirectory)
      ErrorHandler.handle(error)
    }
  }

  async getOneById(id: string) {
    try {
      this.logger.info(`retrieving user data : id : ${id}`, this.logDirectory)
      const user = this.userRepository.findOneBy({ id })

      if (!user) {
        this.logger.error(`user not found : id : ${id}`, this.logDirectory)
        ErrorHandler.NOT_FOUND_MESSAGE('users - user not found')
      }

      return user
    } catch (error) {
      this.logger.error(`error retrieving user : id : ${id}`, this.logDirectory)
      ErrorHandler.NOT_FOUND_MESSAGE('users - error retrieving user')
    }
  }
}
