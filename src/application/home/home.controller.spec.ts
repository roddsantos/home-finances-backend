import { Test, TestingModule } from '@nestjs/testing'
import { HomeController } from './home.controller'
import { BillService } from '../bill/bill.service'
import { HomeService } from './home.service'
import { BankService } from '../bank/bank.service'
import { CreditCardService } from '../credit-card/credit-card.service'
import { SavingsService } from '../savings/savings.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { Savings } from '../savings/savings.entity'
import { DataSource } from 'typeorm'

describe('HomeController', () => {
  let controller: HomeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      imports: [TypeOrmModule.forFeature([Bank, Bill, CreditCard, Savings])],
      providers: [
        HomeService,
        BillService,
        BankService,
        CreditCardService,
        SavingsService
      ],
      exports: [TypeOrmModule, DataSource]
    }).compile()

    controller = module.get<HomeController>(HomeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
