import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

export class IEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @CreateDateColumn() public createdAt: Date

  @UpdateDateColumn() public updatedAt: Date

  @DeleteDateColumn() public deletedAt: Date
}
