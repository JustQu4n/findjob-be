import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { JobSeeker } from '../job-seeker/job-seeker.entity';
import { Company } from '../company/company.entity';

@Entity('followed_companies')
export class FollowedCompany {
  @PrimaryGeneratedColumn('uuid')
  followed_company_id: string;

  @Column({ type: 'uuid' })
  job_seeker_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @CreateDateColumn()
  followed_at: Date;

  // Relationships
  @ManyToOne(() => JobSeeker, (jobSeeker) => jobSeeker.followedCompanies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_seeker_id' })
  jobSeeker: JobSeeker;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
