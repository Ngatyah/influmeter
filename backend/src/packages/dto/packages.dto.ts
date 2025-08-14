import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty({ description: 'Platform (Instagram, TikTok, YouTube, etc.)' })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Package type (Post, Story, Video, etc.)' })
  @IsString()
  packageType: string;

  @ApiProperty({ description: 'Package title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Package description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Package price in USD' })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  price: number;

  @ApiProperty({ description: 'List of deliverables', type: [String] })
  @IsArray()
  @IsString({ each: true })
  deliverables: string[];

  @ApiProperty({ description: 'Turnaround time in days', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  turnaroundDays?: number;

  @ApiProperty({ description: 'Number of revisions included', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  revisions?: number;

  @ApiProperty({ description: 'Whether the package is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePackageDto {
  @ApiProperty({ description: 'Platform (Instagram, TikTok, YouTube, etc.)', required: false })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiProperty({ description: 'Package type (Post, Story, Video, etc.)', required: false })
  @IsString()
  @IsOptional()
  packageType?: string;

  @ApiProperty({ description: 'Package title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Package description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Package price in USD', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'List of deliverables', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @ApiProperty({ description: 'Turnaround time in days', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  turnaroundDays?: number;

  @ApiProperty({ description: 'Number of revisions included', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  revisions?: number;

  @ApiProperty({ description: 'Whether the package is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}