import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Certificate } from './certificate.entity';
import { Admin } from 'src/modules/admins/entities/admin.entities';
import { UserStatus } from 'src/common/enums/enum';

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

  @Column()
  qualification: string;

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
}
