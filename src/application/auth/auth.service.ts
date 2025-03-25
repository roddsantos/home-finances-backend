import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import * as bcrypt from 'bcryptjs'
import { User } from '../user/user.entity'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.getOne(username)
    if (!user) return null
    const isRightPassword = await bcrypt.compare(user.password, password)

    if (isRightPassword) return user
    else return null
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id }
    const token = this.jwtService.sign(payload)
    return {
      token
    }
  }
}
