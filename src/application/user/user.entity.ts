import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  EntityOptions,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

const tableOptions: EntityOptions = {
  name: 'users'
}

@Entity(tableOptions)
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({
    nullable: false
  })
  public name: string

  @Column({
    nullable: false
  })
  public surname: string

  @Column({
    nullable: false,
    unique: true
  })
  public username: string

  @CreateDateColumn() public createdAt: Date

  @UpdateDateColumn() public updatedAt: Date

  @DeleteDateColumn() public deletedAt: Date
}
