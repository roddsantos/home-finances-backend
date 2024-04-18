import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { User } from 'src/application/user/user.entity'
import { DEFAULT_USER } from './seeds.default-user'
import { TYPE_BILLS } from './seeds.type-bills'
import { TypeBill } from 'src/application/type-bill/type-bill.entity'

@Injectable()
export class SeedingService {
  constructor(private readonly entityManager: EntityManager) {}

  async seed(): Promise<void> {
    await Promise.all([
      this.entityManager.save(User, DEFAULT_USER),
      this.entityManager.save(TypeBill, TYPE_BILLS)
    ])
  }
}
