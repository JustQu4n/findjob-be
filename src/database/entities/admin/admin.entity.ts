import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  admin_id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  position: string;

  @Column({ type: 'text', nullable: true })
  permissions: string; // JSON string of permissions

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToOne(() => User, (user) => user.admin)
  @JoinColumn({ name: 'user_id' })
  user: User;
}