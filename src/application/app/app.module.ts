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
import { IdMiddleware } from '../middlewares/general/id.middleware'
// eslint-disable-next-line max-len
import { UpdateBodyThemeMiddleware } from '../middlewares/theme/update.body.theme.middleware'
import { BodySavingMiddleware } from '../middlewares/saving/body.saving.middleware'
import { BodyUpdateBankMiddleware } from '../middlewares/bank/body.update.bank.middleware'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from '../core/auth/auth.guard'
import { AuthModule } from '../core/auth/auth.module'
// eslint-disable-next-line max-len

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
    UserModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedingService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule implements OnApplicationBootstrap, NestModule {
  constructor(private readonly seedingService: SeedingService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DateMiddleware)
      .exclude({
        path: 'home/search',
        method: RequestMethod.GET
      })
      .forRoutes('home')
    consumer.apply(BodyThemeMiddleware).forRoutes({
      path: 'theme',
      method: RequestMethod.POST
    })
    consumer.apply(UpdateBodyThemeMiddleware).forRoutes({
      path: 'theme',
      method: RequestMethod.PATCH
    })
    consumer
      .apply(IdMiddleware)
      .forRoutes(
        { path: 'theme', method: RequestMethod.DELETE },
        { path: 'bill/quick-settle/:id', method: RequestMethod.PATCH },
        { path: 'category/:id', method: RequestMethod.DELETE },
        { path: 'bank/:id', method: RequestMethod.DELETE },
        { path: 'company/:id', method: RequestMethod.DELETE }
      )

    consumer.apply(BodySavingMiddleware).forRoutes({
      path: 'savings',
      method: RequestMethod.POST
    })

    consumer.apply(BodyUpdateBankMiddleware).forRoutes({
      path: 'bank',
      method: RequestMethod.PATCH
    })
  }

  async onApplicationBootstrap(): Promise<void> {
    if (dataBaseConfig.synchronize) await this.seedingService.seed()
  }
}
