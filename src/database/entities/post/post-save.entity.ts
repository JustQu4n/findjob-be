import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from '../user/user.entity';

@Entity('post_saves')
@Unique(['post_id', 'user_id'])
export class PostSave {
  @PrimaryGeneratedColumn('uuid')
  post_save_id: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Post, (post) => post.saves, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
