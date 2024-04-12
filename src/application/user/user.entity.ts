import {
  Table,
  Model,
  TableOptions,
  CreatedAt,
  UpdatedAt,
  DeletedAt
} from 'sequelize-typescript'
import { Column, DataType } from 'sequelize-typescript'

const tableOptions: TableOptions = {
  tableName: 'users'
}

@Table(tableOptions)
export class User extends Model<User> {
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
    allowNull: false
  })
  public surname: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  public username: string

  @CreatedAt public createdAt: Date

  @UpdatedAt public updatedAt: Date

  @DeletedAt public deletedAt: Date
}
