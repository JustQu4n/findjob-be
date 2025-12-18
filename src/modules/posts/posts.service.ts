import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '@/database/entities/post/post.entity';
import { PostLike } from '@/database/entities/post/post-like.entity';
import { PostComment } from '@/database/entities/post/post-comment.entity';
import { PostSave } from '@/database/entities/post/post-save.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private likesRepo: Repository<PostLike>,
    @InjectRepository(PostComment)
    private commentsRepo: Repository<PostComment>,
    @InjectRepository(PostSave)
    private savesRepo: Repository<PostSave>,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const post = this.postsRepo.create({ ...dto, author_id: authorId });
    return this.postsRepo.save(post);
  }

  async findAll(limit = 20, offset = 0) {
    return this.postsRepo.find({
      take: limit,
      skip: offset,
      relations: ['author'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const p = await this.postsRepo.findOne({ where: { post_id: id }, relations: ['author'] });
    if (!p) throw new NotFoundException('Post not found');
    return p;
  }

  async update(userId: string, postId: string, dto: UpdatePostDto) {
    const p = await this.postsRepo.findOne({ where: { post_id: postId } });
    if (!p) throw new NotFoundException('Post not found');
    if (p.author_id !== userId) throw new ForbiddenException('Not allowed');
    Object.assign(p, dto);
    return this.postsRepo.save(p);
  }

  async remove(userId: string, postId: string) {
    const p = await this.postsRepo.findOne({ where: { post_id: postId } });
    if (!p) throw new NotFoundException('Post not found');
    if (p.author_id !== userId) throw new ForbiddenException('Not allowed');
    return this.postsRepo.softDelete({ post_id: postId });
  }

  // Likes
  async like(userId: string, postId: string) {
    const post = await this.postsRepo.findOne({ where: { post_id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const exists = await this.likesRepo.findOne({ where: { post_id: postId, user_id: userId } });
    if (exists) return exists;
    const like = this.likesRepo.create({ post_id: postId, user_id: userId });
    await this.likesRepo.save(like);
    await this.postsRepo.increment({ post_id: postId }, 'likes_count', 1);
    return like;
  }

  async unlike(userId: string, postId: string) {
    const like = await this.likesRepo.findOne({ where: { post_id: postId, user_id: userId } });
    if (!like) throw new NotFoundException('Like not found');
    await this.likesRepo.delete({ post_like_id: like.post_like_id });
    await this.postsRepo.decrement({ post_id: postId }, 'likes_count', 1);
    return { ok: true };
  }

  // Comments
  async comment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.postsRepo.findOne({ where: { post_id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const comment = this.commentsRepo.create({ post_id: postId, user_id: userId, content: dto.content, parent_comment_id: dto.parent_comment_id });
    await this.commentsRepo.save(comment);
    await this.postsRepo.increment({ post_id: postId }, 'comments_count', 1);
    return comment;
  }

  async getComments(postId: string, limit = 50, offset = 0) {
    return this.commentsRepo.find({ where: { post_id: postId }, take: limit, skip: offset, order: { created_at: 'ASC' } });
  }

  async deleteComment(userId: string, postId: string, commentId: string) {
    const c = await this.commentsRepo.findOne({ where: { post_comment_id: commentId } });
    if (!c) throw new NotFoundException('Comment not found');
    if (c.user_id !== userId) throw new ForbiddenException('Not allowed');
    await this.commentsRepo.softDelete({ post_comment_id: commentId });
    await this.postsRepo.decrement({ post_id: postId }, 'comments_count', 1);
    return { ok: true };
  }

  // Save
  async savePost(userId: string, postId: string) {
    const post = await this.postsRepo.findOne({ where: { post_id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const exists = await this.savesRepo.findOne({ where: { post_id: postId, user_id: userId } });
    if (exists) return exists;
    const s = this.savesRepo.create({ post_id: postId, user_id: userId });
    await this.savesRepo.save(s);
    await this.postsRepo.increment({ post_id: postId }, 'saves_count', 1);
    return s;
  }

  async unsavePost(userId: string, postId: string) {
    const s = await this.savesRepo.findOne({ where: { post_id: postId, user_id: userId } });
    if (!s) throw new NotFoundException('Save not found');
    await this.savesRepo.delete({ post_save_id: s.post_save_id });
    await this.postsRepo.decrement({ post_id: postId }, 'saves_count', 1);
    return { ok: true };
  }
}
