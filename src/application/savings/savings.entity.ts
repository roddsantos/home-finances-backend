import {
  Column,
  CreateDateColumn,
  Entity,
  EntityOptions,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Bank } from '../bank/bank.entity'

const tableOptions: EntityOptions = {
  name: 'savings'
}
@Entity(tableOptions)
export class Savings {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({
    nullable: false,
    type: 'float',
    default: 0,
    scale: 2
  })
  public total: number

  @Column({
    nullable: false
  })
  public month: number

  @Column({
    nullable: false
  })
  public year: number

  @Column({
    nullable: false
  })
  public type: string

  @ManyToOne(() => Bank)
  public bank: Bank

  @Column({
    nullable: false
  })
  public bankId: string

  @CreateDateColumn() public createdAt: Date

  @UpdateDateColumn() public updatedAt: Date
}
