import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { JobSeeker } from '../job-seeker/job-seeker.entity';
import { JobPost } from '../job-post/job-post.entity';

@Entity('saved_jobs')
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  saved_job_id: string;

  @Column({ type: 'uuid' })
  job_seeker_id: string;

  @Column({ type: 'uuid' })
  job_post_id: string;

  @CreateDateColumn()
  saved_at: Date;

  // Relationships
  @ManyToOne(() => JobSeeker, (jobSeeker) => jobSeeker.savedJobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_seeker_id' })
  jobSeeker: JobSeeker;

  @ManyToOne(() => JobPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_post_id' })
  jobPost: JobPost;
}
