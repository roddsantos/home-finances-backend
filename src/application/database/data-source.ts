import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

export const AppDataSource = new DataSource({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  synchronize: false,
  migrations: ['dist/application/database/migrations/*.js'],
  multipleStatements: true,
  timezone: 'UTC-4',
  entities: ['dist/**/*.entity.js']
})
