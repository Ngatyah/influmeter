import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { ContentController } from './content.controller';
import { UploadController } from './upload.controller';
import { ContentService } from './content.service';
import { UploadService } from './upload.service';
import { PrismaModule } from '../prisma/prisma.module';

// Ensure upload directories exist
const uploadDir = join(process.cwd(), 'uploads');
const contentDir = join(uploadDir, 'content');
const thumbnailDir = join(uploadDir, 'thumbnails');

[uploadDir, contentDir, thumbnailDir].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          callback(null, contentDir);
        },
        filename: (req, file, callback) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv/i;
        const extName = allowedTypes.test(extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);

        if (extName && mimeType) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Only image files (JPEG, JPG, PNG, GIF, WebP) and video files (MP4, MOV, AVI, MKV) are allowed'
            ),
            false
          );
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 5, // Maximum 5 files per upload
      },
    }),
  ],
  controllers: [ContentController, UploadController],
  providers: [ContentService, UploadService],
  exports: [ContentService, UploadService],
})
export class ContentModule {}