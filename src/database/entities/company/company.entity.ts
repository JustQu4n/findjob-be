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

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string;

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