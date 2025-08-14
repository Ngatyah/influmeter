import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class DiscoverInfluencersDto {
  @ApiProperty({ description: 'Search term for influencer names or usernames', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Minimum followers count', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  minFollowers?: number;

  @ApiProperty({ description: 'Maximum followers count', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  maxFollowers?: number;

  @ApiProperty({ description: 'Comma-separated locations', required: false })
  @IsString()
  @IsOptional()
  locations?: string;

  @ApiProperty({ description: 'Comma-separated niches/categories', required: false })
  @IsString()
  @IsOptional()
  niches?: string;

  @ApiProperty({ description: 'Comma-separated platforms', required: false })
  @IsString()
  @IsOptional()
  platforms?: string;

  @ApiProperty({ description: 'Minimum engagement rate', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  engagementMin?: number;

  @ApiProperty({ description: 'Show only verified accounts', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  verified?: boolean;

  @ApiProperty({ description: 'Page number for pagination', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', required: false, default: 12 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  limit?: number = 12;
}