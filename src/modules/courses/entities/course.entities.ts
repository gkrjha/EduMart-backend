import { Specialization } from 'src/modules/specializations/entities/specialization.entity';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: '0.00' })
  price: string;

  @Column('decimal', { precision: 3, scale: 2, default: '0' })
  avg_rating: string;

  @ManyToOne(() => Teacher, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher | null;

  @Column({ nullable: true })
  teacher_id: string | null;

  @ManyToMany(() => Specialization, { cascade: true })
  @JoinTable({
    name: 'course_specializations',
    joinColumn: { name: 'course_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'specialization_id', referencedColumnName: 'id' },
  })
  specializations: Specialization[];
}
