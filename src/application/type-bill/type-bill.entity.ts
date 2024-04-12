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
  tableName: 'typebills'
}

@Table(tableOptions)
export class TypeBill extends Model<TypeBill> {
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
  public icon: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  public referTo: string

  @CreatedAt public createdAt: Date

  @UpdatedAt public updatedAt: Date

  @DeletedAt public deletedAt: Date
}
