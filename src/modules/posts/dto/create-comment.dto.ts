import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  parent_comment_id?: string;
}
