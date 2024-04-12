import {
  Table,
  Model,
  TableOptions,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript'
import { Column, DataType } from 'sequelize-typescript'
import { User } from '../user/user.entity'

const tableOptions: TableOptions = {
  tableName: 'creditcards'
}

@Table(tableOptions)
export class CreditCard extends Model<CreditCard> {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true
  })
  public id: number

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  public name: string

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  public description: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  public color: string

  @Column({
    type: DataType.NUMBER,
    allowNull: false
  })
  public limit: number

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  public month: string

  @Column({
    type: DataType.NUMBER,
    allowNull: false
  })
  public year: number

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  public isClosed: boolean

  @ForeignKey(() => User)
  @Column({
    type: DataType.NUMBER,
    allowNull: false
  })
  @BelongsTo(() => User)
  public user: number

  @CreatedAt public createdAt: Date

  @UpdatedAt public updatedAt: Date

  @DeletedAt public deletedAt: Date
}
