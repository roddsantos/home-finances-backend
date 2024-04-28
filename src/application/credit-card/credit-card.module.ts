import { Module } from '@nestjs/common'
import { CreditCardController } from './credit-card.controller'
import { CreditCardService } from './credit-card.service'
import { CreditCard } from './credit-card.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([CreditCard])],
  controllers: [CreditCardController],
  providers: [CreditCardService],
  exports: [TypeOrmModule, CreditCardService]
})
export class CreditCardModule {}
