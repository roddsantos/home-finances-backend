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
  name: 'creditcards'
}

@Entity(tableOptions)
export class CreditCard {
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
    nullable: false
  })
  public color: string

  @Column({
    nullable: false
  })
  public limit: number

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
  public isClosed: boolean

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
