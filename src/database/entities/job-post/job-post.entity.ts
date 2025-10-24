import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Employer } from '../employer/employer.entity';
import { Company } from '../company/company.entity';
import { Application } from '../application/application.entity';

export enum EmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  INTERNSHIP = 'internship',
  CONTRACT = 'contract',
}

@Entity('job_posts')
export class JobPost {
  @PrimaryGeneratedColumn()
  job_post_id: number;

  @Column()
  employer_id: number;

  @Column()
  company_id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  salary_range: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    nullable: true,
  })
  employment_type: EmploymentType;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  // Relationships
  @ManyToOne(() => Employer, (employer) => employer.jobPosts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employer_id' })
  employer: Employer;

  @ManyToOne(() => Company, (company) => company.jobPosts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Application, (application) => application.jobPost)
  applications: Application[];
}