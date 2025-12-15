import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  interview_id: string;

  @Column({ type: 'uuid', nullable: true })
  job_post_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  employer_id: string | null;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: string; // draft | active | inactive

  @Column({ type: 'int', nullable: true })
  total_time_minutes: number | null; // Tổng thời gian làm bài (phút)

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date | null; // Hạn chót hoàn thành sau khi assign

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
