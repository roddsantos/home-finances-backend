import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import * as bcrypt from 'bcryptjs'
import { User } from '../user/user.entity'
import { JwtService } from '@nestjs/jwt'
import { ErrorHandler } from '../utils/ErrorHandler'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService
  ) {}

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
    const user = await this.userService.getOneByUsername(username)
    if (!user) return null
    const isRightPassword = await bcrypt.compare(user.password, password)

    if (isRightPassword) return user
    else return null
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
