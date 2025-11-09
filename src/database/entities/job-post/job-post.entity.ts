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
import { EmploymentType } from 'src/common/utils/enums';


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

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

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

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Application, (application) => application.jobPost)
  applications: Application[];
}