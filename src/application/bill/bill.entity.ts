import { User } from '../user/user.entity'
import { Company } from '../company/company.entity'
import { Category } from '../category/category.entity'
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
  public groupId: string

  @Column({
    nullable: false
  })
  public name: string

  @Column({
    nullable: false
  })
  public description: string

  @Column({
    default: 0,
    nullable: false,
    type: 'float',
    scale: 2
  })
  public total: number

  @Column({
    default: 0,
    nullable: false,
    type: 'float',
    scale: 2
  })
  public totalParcel: number

  @Column({
    nullable: false,
    default: false
  })
  public settled: boolean

  @Column({
    nullable: false,
    default: 1
  })
  public parcels: number

  @Column({
    nullable: false,
    default: 0
  })
  public parcel: number

  @Column({
    default: 0,
    nullable: false,
    type: 'float',
    scale: 2
  })
  public taxes: number

  @Column({
    default: 0,
    nullable: false,
    type: 'float',
    scale: 2
  })
  public delta: number

  @Column({
    nullable: false
  })
  public due: Date

  @Column({
    nullable: true
  })
  public paid: Date

  @Column({
    nullable: false
  })
  public type: string

  @ManyToOne(() => Company)
  public company: Company

  @Column({
    nullable: true
  })
  public companyId: string

  @ManyToOne(() => Category)
  public category: Category

  @Column({
    nullable: false
  })
  public categoryId: string

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

  @Column({
    nullable: true
  })
  isPayment: boolean

  @ManyToOne(() => CreditCard)
  public creditCard: CreditCard

  @Column({
    nullable: true
  })
  isRefund: boolean

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
