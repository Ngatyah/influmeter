import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Bio', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'Date of birth', required: false })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ description: 'Location', required: false })
  @IsString()
  @IsOptional()
  location?: string;
}

export class UpdateBrandProfileDto {
  @ApiProperty({ description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ description: 'Industry', required: false })
  @IsArray()
  @IsOptional()
  industry?: string[];

  @ApiProperty({ description: 'Website', required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ description: 'Company description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Target audience', required: false })
  @IsString()
  @IsOptional()
  targetAudience?: string;

  @ApiProperty({ description: 'Brand values', required: false })
  @IsArray()
  @IsOptional()
  brandValues?: string[];

  @ApiProperty({ description: 'Marketing goals', required: false })
  @IsArray()
  @IsOptional()
  marketingGoals?: string[];
}