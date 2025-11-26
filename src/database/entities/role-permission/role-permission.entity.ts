import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../role/role.entity';
import { Permission } from '../permission/permission.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ type: 'uuid' })
  role_id: string;

  @PrimaryColumn({ type: 'uuid' })
  permission_id: string;

  // Relationships
  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}