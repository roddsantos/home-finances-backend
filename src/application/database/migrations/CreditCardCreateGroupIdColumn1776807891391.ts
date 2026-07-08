import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreditCardCreateGroupIdColumn1776807891391 implements MigrationInterface {
  name = 'CreditCardCreateGroupIdColumn1776807891391'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` ADD \`groupId\` varchar(255) NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`creditcards\` DROP COLUMN \`groupId\``)
  }
}
