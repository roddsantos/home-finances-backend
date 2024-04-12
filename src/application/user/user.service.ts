import { Injectable } from '@nestjs/common'
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { ErrorHandler } from '../utils/ErrorHandler'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: typeof User) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const res = await this.userRepository.create(createUserDto)
      return res.id
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    try {
      const res = await this.userRepository.update(updateUserDto, {
        where: { id: updateUserDto.id }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: number) {
    try {
      const res = await this.userRepository.destroy({ where: { id } })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getOne(username: string) {
    try {
      const res = await this.userRepository.findOne<User>({ where: { username } })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
