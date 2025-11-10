import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { JobPost } from '../job-post/job-post.entity';

@Entity('employers')
export class Employer {
  @PrimaryGeneratedColumn('uuid')
  employer_id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  company_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  // Relationships
  @OneToOne(() => User, (user) => user.employer)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, (company) => company.employers, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => JobPost, (jobPost) => jobPost.employer)
  jobPosts: JobPost[];
}