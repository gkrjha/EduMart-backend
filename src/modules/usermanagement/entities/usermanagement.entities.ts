import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_managements')
export class Usermanagement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column()
  status: string;
}
