/* eslint-disable max-len */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateThemeTable1766947210885 implements MigrationInterface {
  name = 'CreateThemeTable1766947210885'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`themes\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`primary\` varchar(255) NOT NULL, \`secondary\` varchar(255) NOT NULL, \`background\` varchar(255) NOT NULL, \`text1\` varchar(255) NOT NULL, \`text2\` varchar(255) NOT NULL, \`borderRadius\` int NOT NULL, \`borderWidth\` varchar(255) NOT NULL, \`font\` varchar(255) NOT NULL, \`inputSize\` varchar(255) NOT NULL, \`padding\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`password\``)
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`password\` varchar(255) NOT NULL DEFAULT ''`
    )
    await queryRunner.query(
      `ALTER TABLE \`banks\` CHANGE \`savings\` \`savings\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`savings\` CHANGE \`total\` \`total\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` CHANGE \`limit\` \`limit\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` CHANGE \`limitLeft\` \`limitLeft\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` CHANGE \`invoice\` \`invoice\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`total\` \`total\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`totalParcel\` \`totalParcel\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`parcel\` \`parcel\` int NOT NULL DEFAULT '1'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`taxes\` \`taxes\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`delta\` \`delta\` float NOT NULL DEFAULT '0.00'`
    )
    await queryRunner.query(
      `ALTER TABLE \`themes\` ADD CONSTRAINT \`FK_51e49bdabf1f680d2595f700f1d\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`themes\` DROP FOREIGN KEY \`FK_51e49bdabf1f680d2595f700f1d\``
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`delta\` \`delta\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`taxes\` \`taxes\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`parcel\` \`parcel\` int NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`totalParcel\` \`totalParcel\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`bills\` CHANGE \`total\` \`total\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` CHANGE \`invoice\` \`invoice\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` CHANGE \`limitLeft\` \`limitLeft\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`creditcards\` CHANGE \`limit\` \`limit\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`savings\` CHANGE \`total\` \`total\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE \`banks\` CHANGE \`savings\` \`savings\` float NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`password\``)
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`password\` varchar(45) NOT NULL`)
    await queryRunner.query(`DROP TABLE \`themes\``)
  }
}
