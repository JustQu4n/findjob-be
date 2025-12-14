import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('candidate_interviews')
export class CandidateInterview {
  @PrimaryGeneratedColumn('uuid')
  candidate_interview_id: string;

  @Column({ type: 'uuid' })
  interview_id: string;

  @Column({ type: 'uuid' })
  application_id: string;

  @Column({ type: 'uuid' })
  candidate_id: string;

  @Column({ type: 'uuid' })
  assigned_by: string;

  @Column({ type: 'timestamp', nullable: true })
  assigned_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'varchar', length: 32, default: 'assigned' })
  status: string;

  @Column({ type: 'numeric', nullable: true })
  total_score: number | null;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  result: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
