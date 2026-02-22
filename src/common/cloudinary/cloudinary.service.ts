import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import toStream = require('buffer-to-stream');
import type {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as CloudinaryType,
} from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof CloudinaryType,
  ) {}

  upload(
    filePath: string,
    options?: Record<string, any>,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!filePath) {
      throw new BadRequestException('File path missing (use diskStorage)');
    }

    return this.cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      ...options,
    });
  }

  uploadImage(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('File buffer missing (use memoryStorage)');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result);
        },
      );

      toStream(file.buffer).pipe(uploadStream);
    });
  }

  async delete(publicId: string) {
    if (!publicId) throw new BadRequestException('public_id is required');
    return this.cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
    });
  }
}
