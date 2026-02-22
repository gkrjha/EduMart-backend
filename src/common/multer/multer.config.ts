import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UnsupportedMediaTypeException } from '@nestjs/common';

const UPLOAD_ROOT = join(process.cwd(), 'uploads', 'chat');

export const FileStorage = diskStorage({
  destination: (req, file, cb) => {
    if (!existsSync(UPLOAD_ROOT)) {
      mkdirSync(UPLOAD_ROOT, { recursive: true });
    }
    cb(null, UPLOAD_ROOT);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
  },
});

export const chatFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: any,
) => {
  const allowed = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/webm',
    'video/mp4',
    'video/mpeg',
    'video/webm',
  ]);

  if (!allowed.has(file.mimetype)) {
    return cb(
      new UnsupportedMediaTypeException(`Invalid file type: ${file.mimetype}`),
      false,
    );
  }

  cb(null, true);
};
