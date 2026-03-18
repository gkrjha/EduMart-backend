import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
