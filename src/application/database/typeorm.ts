import { registerAs } from '@nestjs/config'
import { config as dotenvConfig } from 'dotenv'
import { DataSource, DataSourceOptions } from 'typeorm'

dotenvConfig({ path: '.env' })

const config = {
  type: 'mysql',
  host: `${process.env.DB_HOST}` || 'localhost',
  port: `${process.env.DB_PORT}`,
  username: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_DATABASE}`,
  autoLoadEntities: true,
  synchronize: false,
  timezone: 'UTC-4',
  multipleStatements: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/application/database/migrations/*{.ts,.js}']
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions)
