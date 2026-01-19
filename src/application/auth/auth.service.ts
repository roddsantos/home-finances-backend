import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import * as bcrypt from 'bcryptjs'
import { User } from '../user/user.entity'
import { JwtService } from '@nestjs/jwt'
import { ErrorHandler } from '../utils/ErrorHandler'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'
import { AUTH_MODULE } from '../core/consts/filename.consts'

@Injectable()
export class AuthService extends GeneralService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService
  ) {
    super(path.join(__dirname, AUTH_MODULE.service))
  }

  async generateToken(id: string, username: string) {
    const token = this.jwtService.sign({
      id,
      username
    })

    return {
      expiresIn: process.env.EXPIRES_IN,
      token
    }
  }

  /**
   * Hash a password for a User
   * @param password the password to hash
   * @returns hash of the password
   */
  async hashPassword(password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      return hashedPassword
    } catch (error) {
      return ErrorHandler.handle(error)
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
        this.logger.error('login error', this.logDirectory)
        ErrorHandler.BAD_REQUEST('auth - login error')
      }

      const isRightPassword = await bcrypt.compare(user.password, password)
      if (!isRightPassword) {
        this.logger.error('login error', this.logDirectory)
        ErrorHandler.UNAUTHORIZED('auth - login error')
      }

      return user
    } catch (error) {
      this.logger.error('internal error', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('auth - login error' + error)
    }
  }

  /**
   * Create login token
   * @param user validated user
   * @returns token
   */
  async login(user: User) {
    const payload = { username: user.username, sub: user.id }
    const token = this.jwtService.sign(payload)
    return {
      token
    }
  }
}
