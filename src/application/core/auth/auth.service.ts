import { StringValue } from 'ms'
import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { User } from 'src/application/user/user.entity'
import { JwtService } from '@nestjs/jwt'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { GeneralService } from 'src/application/app/general/service.general'
import * as path from 'path'
import { AUTH_MODULE } from 'src/application/core/consts/filename.consts'
import { UserService } from 'src/application/user/user.service'
import { ValidatedTokenDataType } from '../types/auth'

@Injectable()
export class AuthService extends GeneralService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {
    super(path.join(__dirname, AUTH_MODULE.service))
  }

  generateToken(id: string, username: string) {
    if (!id || !username) {
      this.logger.error('missing id and/or username', this.logDirectory)
      ErrorHandler.BAD_REQUEST('auth - missing id and/or username')
    }

    try {
      const token = this.jwtService.sign(
        { id, username },
        { expiresIn: (process.env.JWT_EXPIRES ?? '1d') as StringValue }
      )

      return token
    } catch (error) {
      this.logger.error('error generating token : error : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('auth - error generating token')
    }
  }

  /**
   * Hash a password for a User
   * @param password the password to hash
   * @returns hash of the password
   */
  async hashPassword(password: string) {
    if (!password) {
      this.logger.error('missing password string', this.logDirectory)
      ErrorHandler.BAD_REQUEST('auth - missing password string')
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      return hashedPassword
    } catch (error) {
      this.logger.error('error crypting password : error : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('auth - error crypting password')
    }
  }

  async verifyPassword(currentPassword: string, newPassword: string) {
    if (!newPassword && !currentPassword) {
      this.logger.error('auth - missing password(s)', this.logDirectory)
      ErrorHandler.BAD_REQUEST('user - missing password(s)')
    }

    try {
      const result = await bcrypt.compare(newPassword, currentPassword)
      return result
    } catch (error) {
      this.logger.error(
        'auth - error verifying password : error : ' + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('auth - error verifying password')
    }
  }

  /**
   * Verify if username or password is correct
   * @param username user's username
   * @param password user's password
   * @returns User if user credential is ok, null otherwise
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.userService.getOneByUsername(username)
      if (!user) {
        this.logger.error('user not found', this.logDirectory)
        ErrorHandler.BAD_REQUEST('user - user not found')
      }

      const isRightPassword = await this.verifyPassword(user.password, password)
      if (!isRightPassword) {
        this.logger.error(`wrong password : password : ${password}`, this.logDirectory)
        ErrorHandler.UNAUTHORIZED('auth - login error')
      }

      return user
    } catch (error) {
      this.logger.error('internal error', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('auth - login error' + error)
    }
  }

  async validateToken(token: string): Promise<ValidatedTokenDataType> {
    try {
      const result = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      })
      return result
    } catch (error) {
      this.logger.error('error verifying token', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('auth - error verifying token' + error)
    }
  }
}
