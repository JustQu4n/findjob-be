import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('interview_answers')
export class InterviewAnswer {
  @PrimaryGeneratedColumn('uuid')
  interview_answer_id: string;

  @Column({ type: 'uuid' })
  candidate_interview_id: string;

  @Column({ type: 'uuid' })
  question_id: string;

  @Column({ type: 'text', nullable: true })
  answer_text: string | null;

  @Column({ type: 'int', nullable: true })
  elapsed_seconds: number | null;

  @Column({ type: 'numeric', nullable: true })
  score: number | null;

  @Column({ type: 'uuid', nullable: true })
  graded_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  graded_at: Date | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
