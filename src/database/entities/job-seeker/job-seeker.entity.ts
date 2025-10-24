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

@Entity('job_seekers')
export class JobSeeker {
  @PrimaryGeneratedColumn()
  job_seeker_id: number;

  @Column({ unique: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resume_url: string;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ type: 'text', nullable: true })
  education: string;

  // Relationships
  @OneToOne(() => User, (user) => user.jobSeeker)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Application, (application) => application.jobSeeker)
  applications: Application[];
}