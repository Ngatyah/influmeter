import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UploadService } from './upload.service';
import { ContentService } from './content.service';

@ApiTags('Content Upload')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('content/upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly contentService: ContentService,
  ) {}

  // Upload files for content submission
  @Post(':contentId')
  @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 files
  @ApiOperation({ summary: 'Upload files for content submission' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'contentId', description: 'Content submission ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async uploadFiles(
    @Param('contentId') contentId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Validate file types
    for (const file of files) {
      if (!this.uploadService.isValidFileType(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, GIF, WebP, MP4, MOV, AVI, MKV`
        );
      }
    }

    try {
      // Process uploaded files (generate thumbnails, etc.)
      const processedFiles = await this.uploadService.processUploadedFiles(files);

      // Save file references to database
      const savedFiles = await this.contentService.addFiles(
        contentId,
        req.user.id,
        processedFiles
      );

      return {
        message: 'Files uploaded successfully',
        files: processedFiles,
        count: files.length,
      };
    } catch (error) {
      // Clean up uploaded files if database save fails
      for (const file of files) {
        await this.uploadService.deleteFile(`/uploads/content/${file.filename}`);
      }
      throw error;
    }
  }

  // Get upload limits and supported formats
  @Get('limits')
  @ApiOperation({ summary: 'Get upload limits and supported file formats' })
  @ApiResponse({ status: 200, description: 'Upload limits retrieved successfully' })
  getUploadLimits() {
    return this.uploadService.getFileSizeLimits();
  }

  // Get upload statistics
  @Get('stats')
  @ApiOperation({ summary: 'Get upload statistics and configuration' })
  @ApiResponse({ status: 200, description: 'Upload stats retrieved successfully' })
  getUploadStats(@Req() req: any) {
    // Only allow admins or for debugging
    if (req.user.role !== 'ADMIN') {
      throw new BadRequestException('Access denied');
    }
    return this.uploadService.getUploadStats();
  }
}