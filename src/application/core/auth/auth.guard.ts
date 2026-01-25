import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { GeneralService } from 'src/application/app/general/service.general'
import * as path from 'path'
import { AUTH_MODULE } from '../consts/filename.consts'

@Injectable()
export class AuthGuard extends GeneralService implements CanActivate {
  constructor(private readonly authService: AuthService) {
    super(path.join(__dirname, AUTH_MODULE.guard))
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { authorization }: any = request.headers

    if (!authorization || authorization.trim() === '') {
      this.logger.error('please provide token', this.logDirectory)
      ErrorHandler.UNAUTHORIZED('auth - please provide token')
    }

    try {
      const authToken = authorization.replace('Bearer ', '').trim()

      const data = await this.authService.validateToken(authToken)
      request.userAuth = data
      this.logger.info(
        `token verified : user id : ${data.id} : expiration date : ${new Date(data.exp * 1000).toISOString()}`,
        this.logDirectory
      )
      return true
    } catch (error) {
      this.logger.error('please provide token', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('auth - error validating token')
    }
  }
}
