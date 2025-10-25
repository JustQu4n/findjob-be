import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { JobSeeker } from '../job-seeker/job-seeker.entity';
import { Employer } from '../employer/employer.entity';
import { Admin } from '../admin/admin.entity';
import { Role } from '../role/role.entity';
import { UserStatus } from 'src/common/utils/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 100 })
  full_name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  email_verification_token: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  email_verification_token_expires: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  password_reset_token: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  password_reset_token_expires: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  refresh_token: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToOne(() => JobSeeker, (jobSeeker) => jobSeeker.user)
  jobSeeker: JobSeeker;

  @OneToOne(() => Employer, (employer) => employer.user)
  employer: Employer;

  @OneToOne(() => Employer, (admin) => admin.user)
  admin: Admin;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'role_id' },
  })
  roles: Role[];
}