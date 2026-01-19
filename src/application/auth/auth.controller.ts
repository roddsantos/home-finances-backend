import { Controller, Post, Body, UnauthorizedException, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ErrorHandler } from '../utils/ErrorHandler'
import { GeneralController } from '../app/general/controller.general'
import { AUTH_MODULE } from '../core/consts/filename.consts'
import { Response } from 'express'
import * as path from 'path'

@Controller('auth')
export class AuthController extends GeneralController {
  constructor(private authService: AuthService) {
    super(path.join(__dirname, AUTH_MODULE.service))
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    // Exemplo simples (o ideal é validar no banco)
    if (body.username !== 'test@test.com' || body.password !== '123') {
      throw new UnauthorizedException()
    }

    try {
      const { username, password } = body

      const user = await this.authService.validateUser(username, password)

      const token = await this.authService.generateToken(user.id, user.username)

      this.logger.info(`login successful : id : ${user.id}`, this.logDirectory)
      return token
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
