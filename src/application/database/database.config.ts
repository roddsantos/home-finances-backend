import { User } from '../user/user.entity'
import { Bank } from '../bank/bank.entity'
import { Bill } from '../bill/bill.entity'
import { Company } from '../company/company.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { Category } from '../category/category.entity'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../../.env') })

export const dataBaseConfig: TypeOrmModuleOptions = {
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  synchronize: false,
  autoLoadEntities: true,
  entities: [User, Bank, Bill, Company, CreditCard, Category],
  multipleStatements: true
}
