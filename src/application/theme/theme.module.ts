import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Theme } from './theme.entity'
import { ThemeController } from './theme.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Theme])],
  controllers: [ThemeController],
  providers: [],
  exports: [TypeOrmModule]
})
export class ThemeModule {}
