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
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

const tableOptions: EntityOptions = {
  name: 'creditcards'
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
  public month: string

  @Column({
    nullable: true
  })
  public year: number

  @ManyToOne(() => Company)
  @Column({
    nullable: true
  })
  @JoinColumn()
  public company: Company

  @ManyToOne(() => TypeBill)
  @Column({
    nullable: false
  })
  public typeBill: TypeBill

  @ManyToOne(() => Bank)
  @Column({
    nullable: true
  })
  public bank1: Bank

  @ManyToOne(() => Bank)
  @Column({
    nullable: true
  })
  public bank2: Bank

  @ManyToOne(() => CreditCard)
  @Column({
    nullable: true
  })
  public creditCard: CreditCard

  @ManyToOne(() => User)
  @Column({
    nullable: false
  })
  public user: User

  @CreateDateColumn() public createdAt: Date

  @UpdateDateColumn() public updatedAt: Date

  @DeleteDateColumn() public deletedAt: Date
}
