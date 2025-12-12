import {
  Controller,
  Post as HttpPost,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @HttpPost()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUser('user_id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async feed(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    const l = limit ? Number(limit) : 20;
    const o = offset ? Number(offset) : 0;
    return this.postsService.findAll(l, o);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@GetUser('user_id') userId: string, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@GetUser('user_id') userId: string, @Param('id') id: string) {
    return this.postsService.remove(userId, id);
  }

  // Likes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @HttpPost(':id/like')
  @HttpCode(HttpStatus.CREATED)
  async like(@GetUser('user_id') userId: string, @Param('id') id: string) {
    return this.postsService.like(userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async unlike(@GetUser('user_id') userId: string, @Param('id') id: string) {
    return this.postsService.unlike(userId, id);
  }

  // Comments
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @HttpPost(':id/comment')
  @HttpCode(HttpStatus.CREATED)
  async comment(@GetUser('user_id') userId: string, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.postsService.comment(userId, id, dto);
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  async getComments(@Param('id') id: string, @Query('limit') limit?: number, @Query('offset') offset?: number) {
    const l = limit ? Number(limit) : 50;
    const o = offset ? Number(offset) : 0;
    return this.postsService.getComments(id, l, o);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @Delete(':postId/comment/:commentId')
  @HttpCode(HttpStatus.OK)
  async deleteComment(@GetUser('user_id') userId: string, @Param('postId') postId: string, @Param('commentId') commentId: string) {
    return this.postsService.deleteComment(userId, postId, commentId);
  }

  // Save
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @HttpPost(':id/save')
  @HttpCode(HttpStatus.CREATED)
  async savePost(@GetUser('user_id') userId: string, @Param('id') id: string) {
    return this.postsService.savePost(userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker', 'employer')
  @Delete(':id/save')
  @HttpCode(HttpStatus.OK)
  async unsavePost(@GetUser('user_id') userId: string, @Param('id') id: string) {
    return this.postsService.unsavePost(userId, id);
  }
}
