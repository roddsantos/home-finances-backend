import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreditCardDropForeignKey1775616171238 implements MigrationInterface {
  name = 'CreditCardDropForeignKey1775616171238'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` DROP FOREIGN KEY \`FK_66af25309c487d813bacd8f5822\``
    )
    await queryRunner.query(
      `DROP INDEX \`IDX_66af25309c487d813bacd8f582\` ON \`creditcards\``
    )
    await queryRunner.query(
      `DROP INDEX \`REL_66af25309c487d813bacd8f582\` ON \`creditcards\``
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_66af25309c487d813bacd8f582\` ON \`creditcards\` (\`relatedBillId\`)`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_66af25309c487d813bacd8f582\` ON \`creditcards\` (\`relatedBillId\`)`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` ADD CONSTRAINT \`FK_66af25309c487d813bacd8f5822\` FOREIGN KEY (\`relatedBillId\`) REFERENCES \`bills\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}
