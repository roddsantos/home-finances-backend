import { Controller, Post, Body, Res, Get, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { GeneralController } from 'src/application/app/general/controller.general'
import { AUTH_MODULE } from 'src/application/core/consts/filename.consts'
import { Response, Request } from 'express'
import * as path from 'path'
import { ResponseHandler } from 'src/application/utils/ResponseHandler'
import { Public } from 'src/application/utils/auth'

@Controller('auth')
export class AuthController extends GeneralController {
  constructor(private authService: AuthService) {
    super(path.join(__dirname, AUTH_MODULE.service))
  }

  @Public()
  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const { username, password } = body

      const user = await this.authService.validateUser(username, password)
      const token = this.authService.generateToken(user.id, user.username)

      this.logger.info(`login successful : id : ${user.id}`, this.logDirectory)
      delete user.password

      return ResponseHandler.sendCreatedResponse({ token, user }, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('validate')
  async validateToken(@Req() req: Request, @Res() res: Response) {
    try {
      const token = req.headers.authorization.split('Bearer ')[1]
      const response = await this.authService.validateToken(token)

      return ResponseHandler.sendResponse(response, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
