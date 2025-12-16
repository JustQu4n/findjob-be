import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Employer } from '../employer/employer.entity';
import { Company } from '../company/company.entity';
import { Category } from '../category/category.entity';
import { Application } from '../application/application.entity';
import { JobPostSkill } from '../job-post-skill/job-post-skill.entity';
import { Interview } from '../interview/interview.entity';
import { JobType, JobLevel, Gender, JobStatus } from 'src/common/utils/enums';


@Entity('job_posts')
export class JobPost {
  @PrimaryGeneratedColumn('uuid')
  job_post_id: string;

  @Column({ type: 'uuid' })
  employer_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  industries: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  experience: string;

  @Column({
    type: 'enum',
    enum: JobLevel,
    nullable: true,
  })
  level: JobLevel;

  @Column({ type: 'varchar', length: 50, nullable: true })
  salary_range: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.ANY,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: JobType,
    nullable: true,
  })
  job_type: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.ACTIVE,
  })
  status: JobStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'int', default: 0 })
  views_count: number;

  @Column({ type: 'int', default: 0 })
  saves_count: number;

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

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Application, (application) => application.jobPost)
  applications: Application[];

  @OneToMany(() => JobPostSkill, (jobPostSkill) => jobPostSkill.jobPost)
  jobPostSkills: JobPostSkill[];

  @OneToMany(() => Interview, (interview) => interview.jobPost)
  interviews: Interview[];
}