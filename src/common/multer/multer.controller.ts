import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileStorage, chatFileFilter } from './multer.config';
import { MulterService } from './multer.service';
@ApiTags('Uploads')
@Controller('uploads')
export class MulterController {
  constructor(private readonly multerService: MulterService) {}

  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: FileStorage,
      fileFilter: chatFileFilter,
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadChatFile(@UploadedFile() file: Express.Multer.File) {
    const uploaded = await this.multerService.uploadChatFile(file);
    return { message: 'Uploaded to Cloudinary', uploaded };
  }
}
