import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './auth.service'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Replace with a secure secret
      signOptions: { expiresIn: process.env.JWT_EXPIRES }
    })
  ],
  controllers: [AuthService],
  providers: [AuthService],
  exports: [TypeOrmModule]
})
export class AuthModule {}
