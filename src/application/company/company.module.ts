import { Module } from '@nestjs/common'
import { CompanyController } from './company.controller'
import { CompanyService } from './company.service'
import { Company } from './company.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from 'src/application/core/auth/auth.module'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [TypeOrmModule]
})
export class CompanyModule {}
