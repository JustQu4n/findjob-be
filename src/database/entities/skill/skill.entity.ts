import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { UserSkill } from '../user-skill/user-skill.entity';
import { JobPostSkill } from '../job-post-skill/job-post-skill.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  name: string;

  // Relationships
  @OneToMany(() => UserSkill, (userSkill) => userSkill.skill)
  userSkills: UserSkill[];

  @OneToMany(() => JobPostSkill, (jobPostSkill) => jobPostSkill.skill)
  jobPostSkills: JobPostSkill[];
}
