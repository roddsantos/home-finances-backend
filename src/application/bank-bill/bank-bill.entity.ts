import { Column, Entity, EntityOptions, ManyToOne } from 'typeorm'
import { IEntity } from '../interfaces/entity.interface'
import { Bank } from '../bank/bank.entity'

const tableOptions: EntityOptions = {
  name: 'bills'
}

@Entity(tableOptions)
export class BankBill extends IEntity {
  @Column({
    nullable: true,
    default: null
  })
  public billId: string

  @ManyToOne(() => Bank)
  public bank1: Bank
  @Column({
    nullable: false
  })
  public bank1Id: string

  @ManyToOne(() => Bank)
  public bank2: Bank
  @Column({
    nullable: true
  })
  public bank2Id: string

  @Column({
    nullable: false,
    default: true
  })
  isPayment: boolean
}
