import { IsOptional } from 'class-validator';
import { UUID } from 'crypto';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';
import { UserStatus } from 'src/common/enum';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  role?: string;

  @Column()
  phone: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ManyToOne(() => Admin, (admin) => admin.subAdmins, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  createdBy?: Admin;

  @OneToMany(() => Admin, (admin) => admin.createdBy)
  subAdmins: Admin[];

  @Column({ nullable: true })
  profile?: string;

  @Column({ default: true })
  @IsOptional()
  isSasS: boolean;

  @OneToMany(() => Teacher, (teacher) => teacher.createdBy)
  teachers: Teacher[];
}
