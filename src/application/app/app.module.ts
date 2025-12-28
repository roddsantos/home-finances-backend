import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
  RequestMethod
} from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { dataBaseConfig } from '../database/database.config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BankModule } from '../bank/bank.module'
import { BillModule } from '../bill/bill.module'
import { CompanyModule } from '../company/company.module'
import { CategoryModule } from '../category/category.module'
import { CreditCardModule } from '../credit-card/credit-card.module'
import { UserModule } from '../user/user.module'
import { SeedingService } from '../database/seeds/seeds.service'
import { DashboardModule } from '../dashboard/dashboard.module'
import { HomeModule } from '../home/home.module'
import { SavingsModule } from '../savings/savings.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import typeorm from '../database/typeorm'
import { DateMiddleware } from '../middlewares/date.middleware'
import { ThemeModule } from '../theme/theme.module'
import { BodyThemeMiddleware } from '../middlewares/theme/body.theme.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('typeorm')
    }),
    BankModule,
    BillModule,
    CategoryModule,
    CompanyModule,
    CreditCardModule,
    DashboardModule,
    HomeModule,
    SavingsModule,
    ThemeModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, SeedingService]
})
export class AppModule implements OnApplicationBootstrap, NestModule {
  constructor(private readonly seedingService: SeedingService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DateMiddleware).forRoutes('home')
    consumer.apply(BodyThemeMiddleware).forRoutes({
      path: 'theme',
      method: RequestMethod.POST
    })
  }

  async onApplicationBootstrap(): Promise<void> {
    if (dataBaseConfig.synchronize) await this.seedingService.seed()
  }
}
