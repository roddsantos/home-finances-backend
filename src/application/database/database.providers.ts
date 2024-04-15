// import { Sequelize } from 'sequelize-typescript'
// import { SEQUELIZE } from '../utils/constants'
// import { User } from '../user/user.entity'
// import { Bank } from '../bank/bank.entity'
// import { Bill } from '../bill/bill.entity'
// import { Company } from '../company/company.entity'
// import { CreditCard } from '../credit-card/credit-card.entity'
// import { TypeBill } from '../type-bill/type-bill.entity'

// export const databaseProviders = [
//   {
//     provide: SEQUELIZE,
//     useFactory: async () => {
//       const sequelize = new Sequelize({
//         database: process.env.DB_DATABASE,
//         username: process.env.DB_USERNAME,
//         password: process.env.DB_PASSWORD,
//         dialect: 'mysql',
//         host: process.env.DB_HOST,
//         port: parseInt(process.env.DB_PORT, 10)
//       })

//       sequelize.addModels([User, Bank, Bill, Company, CreditCard, TypeBill])

//       await sequelize.sync()
//       return sequelize
//     }
//   }
// ]
