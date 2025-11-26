import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobSeeker } from '../job-seeker/job-seeker.entity';
import { Skill } from '../skill/skill.entity';

@Entity('user_skills')
export class UserSkill {
  @PrimaryColumn({ type: 'uuid' })
  job_seeker_id: string;

  @PrimaryColumn({ type: 'int' })
  skill_id: number;

  @Column({ type: 'int', default: 0 })
  endorsement_count: number;

  // Relationships
  @ManyToOne(() => JobSeeker, (jobSeeker) => jobSeeker.userSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_seeker_id' })
  jobSeeker: JobSeeker;

  @ManyToOne(() => Skill, (skill) => skill.userSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
