import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsUrl, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePortfolioItemDto {
  @ApiProperty({ description: 'Portfolio item title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Portfolio item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Brand name' })
  @IsString()
  brandName: string;

  @ApiProperty({ description: 'Platform (Instagram, TikTok, YouTube, etc.)' })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Content type (Post, Video, Story, etc.)' })
  @IsString()
  contentType: string;

  @ApiProperty({ description: 'Thumbnail image URL', required: false })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Live post URL', required: false })
  @IsUrl()
  @IsOptional()
  postUrl?: string;

  @ApiProperty({ description: 'Number of views', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  views?: number;

  @ApiProperty({ description: 'Number of likes', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  likes?: number;

  @ApiProperty({ description: 'Number of shares', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  shares?: number;

  @ApiProperty({ description: 'Number of comments', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  comments?: number;

  @ApiProperty({ description: 'Engagement rate percentage', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  engagement?: number;

  @ApiProperty({ description: 'When the content was published', required: false })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;
}

export class UpdatePortfolioItemDto {
  @ApiProperty({ description: 'Portfolio item title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Portfolio item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Brand name', required: false })
  @IsString()
  @IsOptional()
  brandName?: string;

  @ApiProperty({ description: 'Platform (Instagram, TikTok, YouTube, etc.)', required: false })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiProperty({ description: 'Content type (Post, Video, Story, etc.)', required: false })
  @IsString()
  @IsOptional()
  contentType?: string;

  @ApiProperty({ description: 'Thumbnail image URL', required: false })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Live post URL', required: false })
  @IsUrl()
  @IsOptional()
  postUrl?: string;

  @ApiProperty({ description: 'Number of views', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  views?: number;

  @ApiProperty({ description: 'Number of likes', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  likes?: number;

  @ApiProperty({ description: 'Number of shares', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  shares?: number;

  @ApiProperty({ description: 'Number of comments', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  comments?: number;

  @ApiProperty({ description: 'Engagement rate percentage', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  engagement?: number;

  @ApiProperty({ description: 'When the content was published', required: false })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;
}