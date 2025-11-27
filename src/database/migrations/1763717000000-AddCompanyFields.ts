import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyFields1763717000000 implements MigrationInterface {
  name = 'AddCompanyFields1763717000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "overview" text`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "benefits" text`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "vision" text`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "mission" text`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "innovation" text`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "sustainability" text`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "employees_range" varchar(50)`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "founded_at" date`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "contact_address" varchar(500)`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "contact_email" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "contact_phone" varchar(50)`);

    // Insert sample company data
    await queryRunner.query(`
      INSERT INTO "companies" (
        "company_id", "name", "industry", "description", "location", "website", "logo_url",
        "overview", "benefits", "vision", "mission", "innovation", "sustainability",
        "employees_range", "founded_at", "contact_address", "contact_email", "contact_phone", "created_at", "updated_at"
      ) VALUES (
        '00000000-0000-4000-8000-000000000001',
        'Kim Tin',
        'Information Technology',
        'Được thành lập ngày 29/01/2000, khởi đầu từ một công ty chuyên kinh doanh các sản phẩm vật liệu hàn, kim loại màu...',
        'Abc adress,VN',
        'example.com',
        null,
        'Được thành lập ngày 29/01/2000, khởi đầu từ một công ty chuyên kinh doanh các sản phẩm vật liệu hàn, kim loại màu...',
        'Competitive salary package\nFlexible work arrangements',
        'THAY ĐỔI ĐỂ PHÁT TRIỂN VÀ TRƯỜNG TỒN',
        'Phát triển Kim Tín trở thành một tập đoàn mạnh trong ngành kim khí và gỗ',
        'Luôn đi đầu trong việc ứng dụng công nghệ và đổi mới sáng tạo',
        'Cam kết phát triển bền vững và có trách nhiệm với môi trường',
        '1,000 - 4,999',
        '2000-01-29',
        'Abc adress,VN',
        'contact@example.com',
        '+1234567890',
        now(),
        now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete seeded company
    await queryRunner.query(`DELETE FROM "companies" WHERE "company_id" = '00000000-0000-4000-8000-000000000001'`);

    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "contact_phone"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "contact_email"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "contact_address"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "founded_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "employees_range"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "sustainability"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "innovation"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "mission"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "vision"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "benefits"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "overview"`);
  }
}
