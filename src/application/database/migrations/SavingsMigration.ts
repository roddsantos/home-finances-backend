import { MigrationInterface, QueryRunner } from 'typeorm'

export class SavingsMigration1745889025683 implements MigrationInterface {
  name = 'SavingsMigration1745889025683'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`savings\` (
                \`id\` varchar(36) NOT NULL,
                \`total\` float NOT NULL DEFAULT '0.00',
                \`month\` int NOT NULL,
                \`year\` int NOT NULL,
                \`type\` varchar(255) NOT NULL,
                \`bankId\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            ALTER TABLE \`banks\` CHANGE \`savings\` \`savings\` float NOT NULL DEFAULT '0.00'
        `)
    await queryRunner.query(`
            ALTER TABLE \`creditcards\` CHANGE \`limit\` \`limit\` float NOT NULL DEFAULT '0.00'
        `)
    await queryRunner.query(`
            ALTER TABLE \`creditcards\` CHANGE \`limitLeft\` \`limitLeft\` float NOT NULL DEFAULT '0.00'
        `)
    await queryRunner.query(`
            ALTER TABLE \`creditcards\` CHANGE \`invoice\` \`invoice\` float NOT NULL DEFAULT '0.00'
        `)
    await queryRunner.query(`
            ALTER TABLE \`bills\` CHANGE \`total\` \`total\` float NOT NULL DEFAULT '0.00'
        `)
    await queryRunner.query(`
            ALTER TABLE \`bills\` CHANGE \`totalParcel\` \`totalParcel\` float NOT NULL DEFAULT '0.00'
        `)
    await queryRunner.query(`
            ALTER TABLE \`bills\` CHANGE \`taxes\` \`taxes\` float NOT NULL DEFAULT '0.00'
        `)
    await queryRunner.query(`
            ALTER TABLE \`bills\` CHANGE \`delta\` \`delta\` float NOT NULL DEFAULT '0.00'
        `)
    await queryRunner.query(`
            ALTER TABLE \`savings\`
            ADD CONSTRAINT \`FK_fe7db8430013e4d151714fb60a6\` FOREIGN KEY (\`bankId\`) REFERENCES \`banks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`savings\` DROP FOREIGN KEY \`FK_fe7db8430013e4d151714fb60a6\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`bills\` CHANGE \`delta\` \`delta\` float NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE \`bills\` CHANGE \`taxes\` \`taxes\` float NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE \`bills\` CHANGE \`totalParcel\` \`totalParcel\` float NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE \`bills\` CHANGE \`total\` \`total\` float NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE \`creditcards\` CHANGE \`invoice\` \`invoice\` float NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE \`creditcards\` CHANGE \`limitLeft\` \`limitLeft\` float NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE \`creditcards\` CHANGE \`limit\` \`limit\` float NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE \`banks\` CHANGE \`savings\` \`savings\` float NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            DROP TABLE \`savings\`
        `)
  }
}
