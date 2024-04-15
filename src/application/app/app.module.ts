import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { dataBaseConfig } from '../database/database.config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forRoot(dataBaseConfig)],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
