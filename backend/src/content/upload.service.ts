import { Injectable, BadRequestException } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly contentDir = join(this.uploadDir, 'content');
  private readonly thumbnailDir = join(this.uploadDir, 'thumbnails');

  constructor() {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    const directories = [this.uploadDir, this.contentDir, this.thumbnailDir];
    
    directories.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Multer configuration for file uploads
  getMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          callback(null, this.contentDir);
        },
        filename: (req, file, callback) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow images and videos
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
    };
  }

  // Process uploaded files (generate thumbnails for images)
  async processUploadedFiles(files: Express.Multer.File[]) {
    const processedFiles = [];

    for (const file of files) {
      let thumbnailUrl: string | null = null;

      // Generate thumbnail for images
      if (file.mimetype.startsWith('image/')) {
        try {
          const thumbnailName = `thumb_${uuid()}.webp`;
          const thumbnailPath = join(this.thumbnailDir, thumbnailName);

          await sharp(file.path)
            .resize(300, 300, {
              fit: 'cover',
              position: 'center',
            })
            .webp({ quality: 80 })
            .toFile(thumbnailPath);

          thumbnailUrl = `/uploads/thumbnails/${thumbnailName}`;
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          // Continue without thumbnail if processing fails
        }
      }

      // For videos, you could use ffmpeg to generate video thumbnails
      // For now, we'll use a placeholder or skip thumbnails for videos

      processedFiles.push({
        fileUrl: `/uploads/content/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
        thumbnailUrl,
        // Note: originalName removed as it's not in the database schema
        // originalName: file.originalname,
      });
    }

    return processedFiles;
  }

  // Validate file types
  isValidFileType(mimetype: string): boolean {
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/x-matroska', // .mkv
    ];

    return allowedTypes.includes(mimetype.toLowerCase());
  }

  // Get file size limits
  getFileSizeLimits() {
    return {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5,
      allowedTypes: [
        'JPEG', 'JPG', 'PNG', 'GIF', 'WebP',
        'MP4', 'MOV', 'AVI', 'MKV'
      ],
    };
  }

  // Clean up files (for deletion)
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const fs = require('fs').promises;
      const filePath = join(process.cwd(), fileUrl);
      
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get upload statistics
  getUploadStats() {
    return {
      uploadDirectory: this.contentDir,
      thumbnailDirectory: this.thumbnailDir,
      maxFileSize: '50MB',
      maxFiles: 5,
      supportedFormats: [
        'Images: JPEG, JPG, PNG, GIF, WebP',
        'Videos: MP4, MOV, AVI, MKV'
      ],
    };
  }
}