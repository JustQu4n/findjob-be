import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CandidateInterview } from '../candidate-interview/candidate-interview.entity';
import { InterviewQuestion } from '../interview-question/interview-question.entity';
import { BehaviorType } from './behavior-type.enum';

@Entity('candidate_behavior_logs')
export class CandidateBehaviorLog {
  @PrimaryGeneratedColumn('uuid')
  behavior_log_id: string;

  @Column({ type: 'uuid' })
  candidate_interview_id: string;

  @Column({ type: 'uuid' })
  question_id: string;

  @Column({
    type: 'enum',
    enum: BehaviorType,
  })
  behavior_type: BehaviorType;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => CandidateInterview, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_interview_id' })
  candidateInterview: CandidateInterview;

  @ManyToOne(() => InterviewQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: InterviewQuestion;
}
