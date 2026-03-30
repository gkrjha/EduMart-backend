import { IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
    @IsUUID()
    course_id: string;
}
