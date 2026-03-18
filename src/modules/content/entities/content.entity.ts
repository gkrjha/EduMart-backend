import { Course } from 'src/modules/courses/entities/course.entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum ContentType {
  PDF = 'pdf',
  VIDEO = 'video',
}

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ContentType })
  type: ContentType;

  @Column({ type: 'varchar', nullable: true })
  video_link: string | null;

  @Column({ type: 'varchar', nullable: true })
  pdf_link: string | null;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course: Course;

  @Column()
  course_id: string;
}
