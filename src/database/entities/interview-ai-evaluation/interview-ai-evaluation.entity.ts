import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CandidateInterview } from '../candidate-interview/candidate-interview.entity';

@Entity('interview_ai_evaluations')
export class InterviewAiEvaluation {
  @PrimaryGeneratedColumn('uuid')
  evaluation_id: string;

  @Column({ type: 'uuid' })
  candidate_interview_id: string;

  @Column({ type: 'numeric' })
  total_score: number;

  @Column({ type: 'varchar', length: 20 })
  recommendation: string; // STRONG_FIT | POTENTIAL | NOT_FIT

  @Column({ type: 'jsonb' })
  criteria: {
    technical: number;
    logic: number;
    experience: number;
    clarity: number;
    relevance: number;
  };

  @Column({ type: 'text' })
  ai_summary: string;

  @Column({ type: 'varchar', length: 50 })
  model_used: string; // e.g., "gemini-2.5-flash"

  @Column({ type: 'jsonb', nullable: true })
  detailed_feedback: any | null; // Per-question feedback

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => CandidateInterview, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_interview_id' })
  candidateInterview: CandidateInterview;
}
