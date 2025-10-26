import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Permission } from '../permission/permission.entity';

export enum RoleName {
  ADMIN = 'admin',
  EMPLOYER = 'employer',
  JOBSEEKER = 'jobseeker',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  role_id: string;

  @Column({
    type: 'enum',
    enum: RoleName,
    unique: true,
  })
  role_name: RoleName;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  // Relationships
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'role_id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'permission_id' },
  })
  permissions: Permission[];
}