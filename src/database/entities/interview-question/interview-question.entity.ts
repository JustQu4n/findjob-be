import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('interview_questions')
export class InterviewQuestion {
  @PrimaryGeneratedColumn('uuid')
  question_id: string;

  @Column({ type: 'uuid' })
  interview_id: string;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'int', nullable: true })
  time_limit_seconds: number | null;

  @Column({ type: 'numeric', default: 0 })
  max_score: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
