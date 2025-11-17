import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Application } from '../application/application.entity';
import { SavedJob } from '../saved-job/saved-job.entity';
import { FollowedCompany } from '../followed-company/followed-company.entity';

@Entity('job_seekers')
export class JobSeeker {
  @PrimaryGeneratedColumn('uuid')
  job_seeker_id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resume_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ type: 'text', nullable: true })
  education: string;

  // Relationships
  @OneToOne(() => User, (user) => user.jobSeeker)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Application, (application) => application.jobSeeker)
  applications: Application[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.jobSeeker)
  savedJobs: SavedJob[];

  @OneToMany(() => FollowedCompany, (followedCompany) => followedCompany.jobSeeker)
  followedCompanies: FollowedCompany[];
}