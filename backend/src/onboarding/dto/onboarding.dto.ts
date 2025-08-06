import { IsString, IsArray, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Influencer Onboarding DTOs
export class InfluencerPersonalDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class InfluencerCategoriesDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  niches: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  languages: string[];
}

export class SocialAccountDto {
  @ApiProperty()
  @IsString()
  platform: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  followers?: string;
}

export class InfluencerSocialDto {
  @ApiProperty({ type: [SocialAccountDto] })
  @IsArray()
  accounts: SocialAccountDto[];
}

export class InfluencerRatesDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  contentTypes: string[];

  @ApiProperty()
  @IsObject()
  rates: Record<string, number>;
}

// Brand Onboarding DTOs
export class BrandCompanyDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'])
  companySize?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contactName?: string;
}

export class BrandGoalsDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  campaignTypes: string[];

  @ApiProperty()
  @IsObject()
  targetAudience: Record<string, any>;
}

export class BrandPreferencesDto {
  @ApiProperty()
  @IsString()
  budgetRange: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  platforms: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  influencerTypes: string[];

  @ApiProperty()
  @IsString()
  collaborationStyle: string;
}
