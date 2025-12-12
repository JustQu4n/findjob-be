import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePosts1767000000000 implements MigrationInterface {
    name = 'CreatePosts1767000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posts" ("post_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author_id" uuid NOT NULL, "content" text, "media_urls" json, "likes_count" integer NOT NULL DEFAULT '0', "comments_count" integer NOT NULL DEFAULT '0', "saves_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_4e3b6a1b6f7c9b2d1e8a0f3c2d" PRIMARY KEY ("post_id"))`);
        await queryRunner.query(`CREATE TABLE "post_likes" ("post_like_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7c9d5a3e2f4b1c6a8d0e2f9b4a" PRIMARY KEY ("post_like_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_post_likes_post_user" ON "post_likes" ("post_id", "user_id") `);
        await queryRunner.query(`CREATE TABLE "post_comments" ("post_comment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "user_id" uuid NOT NULL, "content" text NOT NULL, "parent_comment_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_9a1b2c3d4e5f6a7b8c9d0e1f2a" PRIMARY KEY ("post_comment_id"))`);
        await queryRunner.query(`CREATE TABLE "post_saves" ("post_save_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a1b2c3d4e5f6a7b8c9d0e1f2b" PRIMARY KEY ("post_save_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_post_saves_post_user" ON "post_saves" ("post_id", "user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_posts_author_id" ON "posts" ("author_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_post_likes_post_id" ON "post_likes" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_post_comments_post_id" ON "post_comments" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_post_saves_post_id" ON "post_saves" ("post_id") `);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_posts_author" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_post_likes_post" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_post_likes_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_comments" ADD CONSTRAINT "FK_post_comments_post" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_comments" ADD CONSTRAINT "FK_post_comments_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_comments" ADD CONSTRAINT "FK_post_comments_parent" FOREIGN KEY ("parent_comment_id") REFERENCES "post_comments"("post_comment_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_saves" ADD CONSTRAINT "FK_post_saves_post" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_saves" ADD CONSTRAINT "FK_post_saves_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_saves" DROP CONSTRAINT "FK_post_saves_user"`);
        await queryRunner.query(`ALTER TABLE "post_saves" DROP CONSTRAINT "FK_post_saves_post"`);
        await queryRunner.query(`ALTER TABLE "post_comments" DROP CONSTRAINT "FK_post_comments_parent"`);
        await queryRunner.query(`ALTER TABLE "post_comments" DROP CONSTRAINT "FK_post_comments_user"`);
        await queryRunner.query(`ALTER TABLE "post_comments" DROP CONSTRAINT "FK_post_comments_post"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_post_likes_user"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_post_likes_post"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_author"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_saves_post_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_comments_post_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_likes_post_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_posts_author_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_likes_post_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_saves_post_user"`);
        await queryRunner.query(`DROP TABLE "post_saves"`);
        await queryRunner.query(`DROP TABLE "post_comments"`);
        await queryRunner.query(`DROP TABLE "post_likes"`);
        await queryRunner.query(`DROP TABLE "posts"`);
    }

}
