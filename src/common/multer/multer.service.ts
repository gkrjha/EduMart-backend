import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { unlink } from 'fs/promises';

@Injectable()
export class MulterService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadChatFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    const isVideo = file.mimetype?.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Max allowed: ${isVideo ? '100MB' : '10MB'}`,
      );
    }

    const result = await this.cloudinary.upload(file.path, {
      folder: 'chat',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    });


    await unlink(file.path).catch(() => null);
    if ('error' in result) {
      throw new BadRequestException(result.error?.message || 'Upload failed');
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type, 
      format: result.format,
      bytes: result.bytes,
      original_filename: result.original_filename,
    };
  }
}