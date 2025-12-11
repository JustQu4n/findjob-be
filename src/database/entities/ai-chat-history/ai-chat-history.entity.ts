import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('ai_chat_history')
export class AiChatHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @Column({ type: 'text', name: 'user_message' })
  userMessage: string;

  @Column({ type: 'text', name: 'ai_response' })
  aiResponse: string;

  @Column({ type: 'varchar', length: 50, default: 'gemini-1.5-flash' })
  model: string;

  @Column({ type: 'int', name: 'tokens_used', nullable: true })
  tokensUsed: number;

  @Column({ type: 'varchar', length: 50, name: 'user_type', nullable: true })
  userType: string; // 'job_seeker', 'employer', 'admin', 'guest'

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
