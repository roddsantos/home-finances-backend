import { Module, OnApplicationBootstrap } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { dataBaseConfig } from '../database/database.config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BankModule } from '../bank/bank.module'
import { BillModule } from '../bill/bill.module'
import { CompanyModule } from '../company/company.module'
import { TypeBillModule } from '../type-bill/type-bill.module'
import { CreditCardModule } from '../credit-card/credit-card.module'
import { UserModule } from '../user/user.module'
import { SeedingService } from '../database/seeds/seeds.service'

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...dataBaseConfig }),
    BankModule,
    BillModule,
    CompanyModule,
    CreditCardModule,
    TypeBillModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, SeedingService]
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly seedingService: SeedingService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (dataBaseConfig.synchronize) await this.seedingService.seed()
  }
}
