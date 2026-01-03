import {
  Column,
  CreateDateColumn,
  Entity,
  EntityOptions,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from '../user/user.entity'

const tableOptions: EntityOptions = {
  name: 'themes'
}
@Entity(tableOptions)
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({
    nullable: false
  })
  public title: string

  @Column({
    nullable: false
  })
  public description: string

  @Column({
    nullable: false
  })
  public primary: string

  @Column({
    nullable: false
  })
  public secondary: string

  @Column({
    nullable: false
  })
  public background: string

  @Column({
    nullable: false
  })
  public text1: string

  @Column({
    nullable: false
  })
  public text2: string

  @Column({
    nullable: false
  })
  public borderRadius: number

  @Column({
    nullable: false
  })
  public borderWidth: string

  @Column({
    nullable: false
  })
  public font1: string

  @Column({
    nullable: false
  })
  public font2: string

  @Column({
    nullable: false
  })
  public inputSize: string

  @Column({
    nullable: false
  })
  public padding: string

  @Column({
    nullable: false
  })
  public theme: string

  @ManyToOne(() => User)
  public user: User

  @Column({
    nullable: false
  })
  public userId: string

  @CreateDateColumn() public createdAt: Date

  @UpdateDateColumn() public updatedAt: Date
}
