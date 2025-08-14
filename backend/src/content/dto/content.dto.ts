import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  IsNumber,
  ValidateNested,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType, ContentStatus, PostStatus } from '@prisma/client';

// Create Content Submission DTO
export class CreateContentSubmissionDto {
  @ApiProperty({ description: 'Campaign ID' })
  @IsUUID()
  campaignId: string;

  @ApiProperty({ description: 'Content title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Content description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Content caption', required: false })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiProperty({ description: 'Hashtags array', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];

  @ApiProperty({ description: 'Platforms array', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  platforms?: string[];

  @ApiProperty({ description: 'Content type', enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ description: 'Payment amount', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;
}

// Update Content Submission DTO
export class UpdateContentSubmissionDto {
  @ApiProperty({ description: 'Content title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Content description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Content caption', required: false })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiProperty({ description: 'Hashtags array', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];

  @ApiProperty({ description: 'Platforms array', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  platforms?: string[];

  @ApiProperty({ description: 'Payment amount', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;
}

// Content Status Update DTO
export class UpdateContentStatusDto {
  @ApiProperty({ description: 'Content status', enum: ContentStatus })
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @ApiProperty({ description: 'Feedback message', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;
}

// Content File Upload DTO
export class ContentFileDto {
  @ApiProperty({ description: 'File URL' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: 'File type (mime type)' })
  @IsString()
  fileType: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fileSize?: number;

  @ApiProperty({ description: 'Thumbnail URL', required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}

// Content Filter DTO for Browse/Search
export class ContentFilterDto {
  @ApiProperty({ description: 'Search term', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Content status filter', required: false })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @ApiProperty({ description: 'Content type filter', required: false })
  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @ApiProperty({ description: 'Campaign ID filter', required: false })
  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @ApiProperty({ description: 'Page number', required: false, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// Content Performance DTO
export class ContentPerformanceDto {
  @ApiProperty({ description: 'View count' })
  @IsNumber()
  @Min(0)
  views: number;

  @ApiProperty({ description: 'Like count' })
  @IsNumber()
  @Min(0)
  likes: number;

  @ApiProperty({ description: 'Comment count' })
  @IsNumber()
  @Min(0)
  comments: number;

  @ApiProperty({ description: 'Share count' })
  @IsNumber()
  @Min(0)
  shares: number;

  @ApiProperty({ description: 'Engagement rate', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  engagementRate?: number;

  @ApiProperty({ description: 'Reach count', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reach?: number;

  @ApiProperty({ description: 'Impression count', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  impressions?: number;
}

// Create Published Post DTO
export class CreatePublishedPostDto {
  @ApiProperty({ description: 'Content submission ID' })
  @IsUUID()
  contentId: string;

  @ApiProperty({ description: 'Social media platform' })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Post URL on social media' })
  @IsString()
  postUrl: string;

  @ApiProperty({ description: 'Platform post ID', required: false })
  @IsString()
  @IsOptional()
  platformPostId?: string;

  @ApiProperty({ description: 'Post type (POST, STORY, REEL, etc.)', required: false })
  @IsString()
  @IsOptional()
  postType?: string;

  @ApiProperty({ description: 'Published date and time' })
  @IsDateString()
  publishedAt: string;
}

// Update Published Post DTO
export class UpdatePublishedPostDto {
  @ApiProperty({ description: 'Post URL on social media', required: false })
  @IsString()
  @IsOptional()
  postUrl?: string;

  @ApiProperty({ description: 'Platform post ID', required: false })
  @IsString()
  @IsOptional()
  platformPostId?: string;

  @ApiProperty({ description: 'Post type (POST, STORY, REEL, etc.)', required: false })
  @IsString()
  @IsOptional()
  postType?: string;

  @ApiProperty({ description: 'Published date and time', required: false })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @ApiProperty({ description: 'Post status', enum: PostStatus, required: false })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;
}