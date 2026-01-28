import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ErrorHandler } from 'src/application/utils/ErrorHandler'
import { GeneralService } from 'src/application/app/general/service.general'
import * as path from 'path'
import { AUTH_MODULE } from '../consts/filename.consts'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from 'src/application/utils/auth'
import { Request } from 'express'

@Injectable()
export class AuthGuard extends GeneralService implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private reflector: Reflector
  ) {
    super(path.join(__dirname, AUTH_MODULE.guard))
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const { authorization }: any = request.headers

    if (!authorization || authorization.trim() === '') {
      this.logger.error('please provide token', this.logDirectory)
      ErrorHandler.UNAUTHORIZED('auth - please provide token')
    }

    try {
      const authToken = authorization.replace('Bearer ', '').trim()

      const data = await this.authService.validateToken(authToken)
      request.user = data
      return true
    } catch (error) {
      this.logger.error('please provide token', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('auth - error validating token')
    }
  }
}
