import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class BanksCreateIsPiggyBankColumn1747704456507 implements MigrationInterface {
  name = 'BanksCreateIsPiggyBankColumn1747704456507'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'creditcards',
      new TableColumn({
        name: 'relatedBill',
        type: 'boolean',
        isNullable: false,
        default: 0
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('savings', 'isPiggyBank')
  }
}
