import { Student } from 'src/modules/students/entities/student.entity';
import { Course } from 'src/modules/courses/entities/course.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PurchaseStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export enum PaymentGateway {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
}

@Entity('course_purchases')
export class CoursePurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @Column()
  student_id: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course: Course;

  @Column()
  course_id: string;

  @Column({ unique: true })
  transaction_id: string;

  @Column({ type: 'enum', enum: PaymentGateway })
  payment_gateway: PaymentGateway;

  @Column({ nullable: true })
  gateway_order_id: string; // Razorpay order_id / Stripe PaymentIntent id

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expire_at: Date;

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING,
  })
  status: PurchaseStatus;
}
