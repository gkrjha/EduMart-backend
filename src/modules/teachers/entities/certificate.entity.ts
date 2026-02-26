import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Teacher } from './teacher.entity';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  x_certificate: string;

  @Column()
  xii_certificate: string;

  @Column()
  bachlor_certificate: string;

  @Column({ nullable: true })
  master_certificate?: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.certificates)
  teacher: Teacher;
}
