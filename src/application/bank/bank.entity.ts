import { User } from '../user/user.entity'
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
  name: 'banks'
}

@Entity(tableOptions)
export class Bank {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({
    nullable: false
  })
  public name: string

  @Column({
    nullable: false
  })
  public description: string

  @Column({
    nullable: false
  })
  public color: string

  @Column({
    nullable: false,
    type: 'float',
    default: 0,
    scale: 2
  })
  public savings: number

  @Column({
    nullable: false,
    default: false
  })
  public isPiggyBank: boolean

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
