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
  @PrimaryGeneratedColumn()
  employer_id: number;

  @Column({ unique: true })
  user_id: number;

  @Column({ nullable: true })
  company_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

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