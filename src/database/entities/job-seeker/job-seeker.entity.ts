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
import { Experience } from '../experience/experience.entity';
import { UserSkill } from '../user-skill/user-skill.entity';
import { Education } from '../education/education.entity';
import { Project } from '../project/project.entity';

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

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_url: string;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'int', nullable: true })
  experience: number;

  @Column({ type: 'text', nullable: true })
  education: string;

  @Column({ type: 'jsonb', nullable: true })
  preferred_locations: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  preferred_job_level: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preferred_job_type: string;

  @Column({ type: 'int', nullable: true })
  expected_salary: number;

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

  @OneToMany(() => Experience, (experience) => experience.jobSeeker)
  experiences: Experience[];

  @OneToMany(() => UserSkill, (userSkill) => userSkill.jobSeeker)
  userSkills: UserSkill[];

  @OneToMany(() => Education, (education) => education.jobSeeker)
  educations: Education[];

  @OneToMany(() => Project, (project) => project.jobSeeker)
  projects: Project[];
}