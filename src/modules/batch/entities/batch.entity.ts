import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';
import { WeekDays } from 'src/common/enums/enum';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'uuid' })
  course_id: string;

  @ManyToOne(() => Teacher, { nullable: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ type: 'enum', enum: WeekDays, array: true })
  days: WeekDays[];
}
