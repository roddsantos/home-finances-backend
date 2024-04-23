import { User } from '../user/user.entity'
import { Company } from '../company/company.entity'
import { TypeBill } from '../type-bill/type-bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { Bank } from '../bank/bank.entity'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  EntityOptions,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

const tableOptions: EntityOptions = {
  name: 'bills'
}

@Entity(tableOptions)
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({
    nullable: false
  })
  public name: string

  @Column({
    nullable: true
  })
  public description: string

  @Column({
    nullable: true
  })
  public total: number

  @Column({
    nullable: false
  })
  public settled: boolean

  @Column({
    nullable: true
  })
  public parcels: number

  @Column({
    nullable: true
  })
  public taxes: number

  @Column({
    nullable: true
  })
  public delta: number

  @Column({
    nullable: true
  })
  public due: Date

  @Column({
    nullable: false
  })
  public month: number

  @Column({
    nullable: true
  })
  public year: number

  @ManyToOne(() => Company)
  public company: Company

  @Column({
    nullable: true
  })
  public companyId: string

  @ManyToOne(() => TypeBill)
  public typeBill: TypeBill

  @Column({
    nullable: false
  })
  public typeBillId: string

  @ManyToOne(() => Bank)
  public bank1: Bank

  @Column({
    nullable: true
  })
  public bank1Id: string

  @ManyToOne(() => Bank)
  public bank2: Bank

  @Column({
    nullable: true
  })
  public bank2Id: string

  @ManyToOne(() => CreditCard)
  public creditCard: CreditCard

  @Column({
    nullable: true
  })
  public creditCardId: string

  @ManyToOne(() => User)
  public user: User

  @Column({
    nullable: false
  })
  public userId: string

  @CreateDateColumn() public createdAt: Date

  @UpdateDateColumn() public updatedAt: Date

  @DeleteDateColumn() public deletedAt: Date
}
