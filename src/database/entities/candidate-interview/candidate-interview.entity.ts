import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Interview } from '../interview/interview.entity';
import { Application } from '../application/application.entity';


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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'candidate_id' })
  candidate: User;

  @Column({ type: 'uuid' })
  assigned_by: string;

  @Column({ type: 'timestamp', nullable: true })
  assigned_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deadline_at: Date | null; // Hạn chót phải hoàn thành bài (assigned_at + interview.deadline)

  @Column({ type: 'varchar', length: 32, default: 'assigned' })
  status: string; // assigned | in_progress | submitted | timeout

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

  // Relations
  @ManyToOne(() => Interview, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
