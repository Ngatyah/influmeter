import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsScheduler } from './campaigns.scheduler';
import { PrismaModule } from '../prisma/prisma.module';

// Ensure upload directories exist
const uploadDir = join(process.cwd(), 'uploads');
const campaignBriefsDir = join(uploadDir, 'campaign-briefs');

[uploadDir, campaignBriefsDir].forEach(dir => {
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
          callback(null, campaignBriefsDir);
        },
        filename: (req, file, callback) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow documents and images for campaign briefs
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|md/i;
        const extName = allowedTypes.test(extname(file.originalname).toLowerCase());
        const allowedMimeTypes = /image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|text\//i;
        const mimeType = allowedMimeTypes.test(file.mimetype);

        if (extName && mimeType) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Only image files (JPEG, PNG, GIF, WebP) and document files (PDF, DOC, DOCX, TXT, MD) are allowed'
            ),
            false
          );
        }
      },
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit for documents
        files: 10, // Maximum 10 files per upload
      },
    }),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignsScheduler],
  exports: [CampaignsService],
})
export class CampaignsModule {}