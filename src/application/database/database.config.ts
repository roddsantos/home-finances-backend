import { User } from '../user/user.entity'
import { Bank } from '../bank/bank.entity'
import { Bill } from '../bill/bill.entity'
import { Company } from '../company/company.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { TypeBill } from '../type-bill/type-bill.entity'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const dataBaseConfig: TypeOrmModuleOptions = {
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  synchronize: false,
  entities: [User, Bank, Bill, Company, CreditCard, TypeBill]
}
