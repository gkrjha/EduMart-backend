import { UUID } from 'crypto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  role: string;

  @Column()
  phone: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  refId: string;

  @Column({ nullable: true })
  profile?: string;
}
