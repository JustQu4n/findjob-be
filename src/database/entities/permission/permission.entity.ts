import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from '../role/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  permission_id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  permission_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  // Relationships
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}