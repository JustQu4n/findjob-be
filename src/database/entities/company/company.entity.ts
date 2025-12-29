import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employer } from '../employer/employer.entity';
import { JobPost } from '../job-post/job-post.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  company_id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Company overview (long description / history)
  @Column({ type: 'text', nullable: true })
  overview: string;

  // Company benefits (stored as plain text or newline-separated list)
  @Column({ type: 'text', nullable: true })
  benefits: string;

  // Company values - store core pieces as separate columns for clarity
  @Column({ type: 'text', nullable: true })
  vision: string;

  @Column({ type: 'text', nullable: true })
  mission: string;

  @Column({ type: 'text', nullable: true })
  innovation: string;

  @Column({ type: 'text', nullable: true })
  sustainability: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  // Employees range (e.g. "1,000 - 4,999")
  @Column({ type: 'varchar', length: 50, nullable: true })
  employees_range: string;

  // Founded date
  @Column({ type: 'date', nullable: true })
  founded_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_url: string;

  // Contact information
  @Column({ type: 'varchar', length: 500, nullable: true })
  contact_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contact_phone: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relationships
  @OneToMany(() => Employer, (employer) => employer.company)
  employers: Employer[];

  @OneToMany(() => JobPost, (jobPost) => jobPost.company)
  jobPosts: JobPost[];
}