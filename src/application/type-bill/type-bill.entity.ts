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
  name: 'typebills'
}

@Entity(tableOptions)
export class TypeBill {
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
  public icon: string

  @Column({
    nullable: false,
    unique: true
  })
  public referTo: string

  @CreateDateColumn() public createdAt: Date

  @UpdateDateColumn() public updatedAt: Date

  @DeleteDateColumn() public deletedAt: Date
}
