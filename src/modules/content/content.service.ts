import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentType } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Course } from '../courses/entities/course.entities';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const course = await this.courseRepository.findOne({
      where: { id: createContentDto.course_id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (
      createContentDto.type === ContentType.VIDEO &&
      !createContentDto.video_link
    ) {
      throw new BadRequestException('Video link is required');
    }

    if (
      createContentDto.type === ContentType.PDF &&
      !createContentDto.pdf_link
    ) {
      throw new BadRequestException('PDF link is required');
    }
    const contentData = {
      title: createContentDto.title,
      type: createContentDto.type,
      course_id: createContentDto.course_id,
      video_link:
        createContentDto.type === ContentType.VIDEO
          ? createContentDto.video_link
          : null,
      pdf_link:
        createContentDto.type === ContentType.PDF
          ? createContentDto.pdf_link
          : null,
    };

    const content = this.contentRepository.create(contentData);
    return await this.contentRepository.save(content);
  }

  async findAll(courseId?: string): Promise<Content[]> {
    if (courseId) {
      return await this.contentRepository.find({
        where: { course_id: courseId },
        relations: ['course'],
      });
    }
    return await this.contentRepository.find({ relations: ['course'] });
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async update(
    id: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findOne(id);

    const newType = updateContentDto.type || content.type;

    if (newType === ContentType.VIDEO) {
      const videoLink = updateContentDto.video_link || content.video_link;
      if (!videoLink) {
        throw new BadRequestException(
          'Video link is required for video content',
        );
      }
      content.video_link = videoLink;
      content.pdf_link = null;
    } else if (newType === ContentType.PDF) {
      const pdfLink = updateContentDto.pdf_link || content.pdf_link;
      if (!pdfLink) {
        throw new BadRequestException('PDF link is required for PDF content');
      }
      content.pdf_link = pdfLink;
      content.video_link = null;
    }

    if (updateContentDto.title) content.title = updateContentDto.title;
    if (updateContentDto.type) content.type = updateContentDto.type;

    return await this.contentRepository.save(content);
  }

  async remove(id: string): Promise<{ message: string }> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
    return { message: 'Content deleted successfully' };
  }
}
