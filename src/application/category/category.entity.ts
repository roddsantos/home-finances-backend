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
import { User } from '../user/user.entity'

const tableOptions: EntityOptions = {
  name: 'categories'
}

@Entity(tableOptions)
export class Category {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({
    nullable: false,
    unique: true
  })
  public name: string

  @Column({
    nullable: false
  })
  public description: string

  @Column({
    nullable: false
  })
  public icon: string

  @Column({
    nullable: false
  })
  public color: string

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
