import { NestFactory } from '@nestjs/core'
import { AppModule } from './application/app/app.module'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env') })

export const appConfig = {
  port: parseInt(process.env.DB_PORT),
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'mysql'
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: [
      'Access-Control-Allow-Headers',
      'Origin',
      'Accept',
      'X-Requested-With',
      'Content-Type',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'Authorization'
    ]
  })

  await app.listen(process.env.PORT)
}
bootstrap()
