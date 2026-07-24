import { Module } from '@nestjs/common'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { Category } from './category.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheService } from '../cache/cache.service'

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService, CacheService],
  exports: [TypeOrmModule, CategoryService]
})
export class CategoryModule {}
