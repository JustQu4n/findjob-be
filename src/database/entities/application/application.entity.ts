import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { JobPost } from '../job-post/job-post.entity';
import { JobSeeker } from '../job-seeker/job-seeker.entity';
import { ApplicationStatus } from 'src/common/utils/enums';


@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  application_id: string;

  @Column({ type: 'uuid' })
  job_post_id: string;

  @Column({ type: 'uuid' })
  job_seeker_id: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  applied_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relationships
  @ManyToOne(() => JobPost, (jobPost) => jobPost.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_post_id' })
  jobPost: JobPost;

  @ManyToOne(() => JobSeeker, (jobSeeker) => jobSeeker.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_seeker_id' })
  jobSeeker: JobSeeker;
}