import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Certificate } from './certificate.entity';
import { Admin } from 'src/modules/admins/entities/admin.entities';
import { Gender, Qualification, UserStatus } from 'src/common/enums/enum';
import { Specialization } from 'src/modules/specializations/entities/specialization.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: Qualification })
  qualification: Qualification;

  @Column()
  experience: number;

  @Column({ nullable: true })
  profile?: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ManyToOne(() => Admin, (admin) => admin.teachers, {
    nullable: false,
  })
  createdBy: Admin;

  @OneToMany(() => Certificate, (certificate) => certificate.teacher)
  certificates: Certificate[];

  @ManyToMany(() => Specialization)
  @JoinTable({
    name: 'teacher_specializations',
    joinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'specialization_id',
      referencedColumnName: 'id',
    },
  })
  specializations: Specialization[];
}
