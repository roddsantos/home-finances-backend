import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreditCardsCreateRelatedBillIdColumn1773456254316
  implements MigrationInterface
{
  name = 'CreditCardsCreateRelatedBillIdColumn1773456254316'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` ADD \`relatedBillId\` varchar(255) NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` ADD UNIQUE INDEX \`IDX_66af25309c487d813bacd8f582\` (\`relatedBillId\`)`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_66af25309c487d813bacd8f582\` ON \`creditcards\` (\`relatedBillId\`)`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` ADD CONSTRAINT \`FK_66af25309c487d813bacd8f5822\`` +
        ` FOREIGN KEY (\`relatedBillId\`) REFERENCES \`bills\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` DROP FOREIGN KEY \`FK_66af25309c487d813bacd8f5822\``
    )
    await queryRunner.query(
      `DROP INDEX \`REL_66af25309c487d813bacd8f582\` ON \`creditcards\``
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` DROP INDEX \`IDX_66af25309c487d813bacd8f582\``
    )
    await queryRunner.query(`ALTER TABLE \`creditcards\` DROP COLUMN \`relatedBillId\``)
  }
}
