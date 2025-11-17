import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobSeeker } from '../job-seeker/job-seeker.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  job_seeker_id: string;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  role: string;

  @Column({ type: 'date', nullable: false })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'boolean', default: false })
  is_current: boolean;

  @Column({ type: 'text', nullable: true })
  project_url: string;

  @Column({ type: 'text', nullable: true })
  repo_url: string;

  @Column({ type: 'text', nullable: true })
  company_name: string;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => JobSeeker, (jobSeeker) => jobSeeker.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_seeker_id' })
  jobSeeker: JobSeeker;
}
