import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from '@/database/entities/post/post.entity';
import { PostLike } from '@/database/entities/post/post-like.entity';
import { PostComment } from '@/database/entities/post/post-comment.entity';
import { PostSave } from '@/database/entities/post/post-save.entity';
import { User } from '@/database/entities/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike, PostComment, PostSave, User])],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
