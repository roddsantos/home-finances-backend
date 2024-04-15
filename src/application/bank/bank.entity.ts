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
  name: 'bank'
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
    nullable: false
  })
  public savings: number

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
