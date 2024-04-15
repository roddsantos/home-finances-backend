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
  name: 'companies'
}

@Entity(tableOptions)
export class Company {
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

  @ManyToOne(() => User)
  public user: User

  @Column({
    nullable: false
  })
  public userId: string

  @CreateDateColumn()
  public createdAt: Date

  @UpdateDateColumn() public updatedAt: Date

  @DeleteDateColumn() public deletedAt: Date
}
