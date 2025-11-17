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

@Entity('educations')
export class Education {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  job_seeker_id: string;

  @Column({ type: 'text', nullable: false })
  school: string;

  @Column({ type: 'text', nullable: true })
  degree: string;

  @Column({ type: 'text', nullable: true })
  field: string;

  @Column({ type: 'text', nullable: true })
  grade: string;

  @Column({ type: 'date', nullable: false })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'boolean', default: false })
  is_current: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  activities: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => JobSeeker, (jobSeeker) => jobSeeker.educations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_seeker_id' })
  jobSeeker: JobSeeker;
}
