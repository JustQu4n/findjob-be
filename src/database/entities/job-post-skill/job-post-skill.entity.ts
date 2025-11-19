import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobPost } from '../job-post/job-post.entity';
import { Skill } from '../skill/skill.entity';

@Entity('job_post_skills')
export class JobPostSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  job_post_id: string;

  @Column({ type: 'int' })
  skill_id: number;

  // Relationships
  @ManyToOne(() => JobPost, (jobPost) => jobPost.jobPostSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_post_id' })
  jobPost: JobPost;

  @ManyToOne(() => Skill, (skill) => skill.jobPostSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
