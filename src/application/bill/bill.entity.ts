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
import { Company } from '../company/company.entity'
import { TypeBill } from '../type-bill/type-bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { Bank } from '../bank/bank.entity'

const tableOptions: TableOptions = {
  tableName: 'creditcards'
}

@Table(tableOptions)
export class Bill extends Model<Bill> {
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
    type: DataType.NUMBER,
    allowNull: true
  })
  public total: number

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  public settled: boolean

  @Column({
    type: DataType.NUMBER,
    allowNull: true
  })
  public parcels: number

  @Column({
    type: DataType.NUMBER,
    allowNull: true
  })
  public taxes: number

  @Column({
    type: DataType.NUMBER,
    allowNull: true
  })
  public delta: number

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  public due: Date

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  public month: string

  @Column({
    type: DataType.NUMBER,
    allowNull: true
  })
  public year: number

  @ForeignKey(() => Company)
  @Column({
    type: DataType.NUMBER,
    allowNull: true
  })
  @BelongsTo(() => Company)
  public company: number

  @ForeignKey(() => TypeBill)
  @Column({
    type: DataType.NUMBER,
    allowNull: false
  })
  @BelongsTo(() => TypeBill)
  public typeBill: number

  @ForeignKey(() => Bank)
  @Column({
    type: DataType.NUMBER,
    allowNull: true
  })
  @BelongsTo(() => Bank)
  public bank1: number

  @ForeignKey(() => Bank)
  @Column({
    type: DataType.NUMBER,
    allowNull: true
  })
  @BelongsTo(() => Bank)
  public bank2: number

  @ForeignKey(() => CreditCard)
  @Column({
    type: DataType.NUMBER,
    allowNull: true
  })
  @BelongsTo(() => CreditCard)
  public creditCard: number

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
