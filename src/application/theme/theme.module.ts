import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Theme } from './theme.entity'
import { ThemeController } from './theme.controller'
import { ThemeService } from './theme.service'

@Module({
  imports: [TypeOrmModule.forFeature([Theme])],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [TypeOrmModule]
})
export class ThemeModule {}
