import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus } from '@prisma/client';

// Create Campaign DTO
export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Campaign objective' })
  @IsString()
  objective: string;

  @ApiProperty({ description: 'Campaign description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Campaign budget', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @ApiProperty({ description: 'Campaign start date', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Campaign end date', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Maximum number of influencers needed', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxInfluencers?: number;

  @ApiProperty({ description: 'Target audience criteria', required: false })
  @IsObject()
  @IsOptional()
  targetCriteria?: object;

  @ApiProperty({ description: 'Campaign requirements', required: false })
  @IsObject()
  @IsOptional()
  requirements?: object;

  @ApiProperty({ description: 'Campaign status', required: false, enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  // Approval Settings
  @ApiProperty({ 
    description: 'Whether content submissions require approval before posting',
    required: false,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiProperty({ 
    description: 'List of influencer IDs that are auto-approved for this campaign',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  autoApproveInfluencers?: string[];

  @ApiProperty({ 
    description: 'Instructions for content approval process',
    required: false
  })
  @IsString()
  @IsOptional()
  approvalInstructions?: string;

  @ApiProperty({ 
    description: 'Content brief description',
    required: false
  })
  @IsString()
  @IsOptional()
  contentBrief?: string;
}

// Update Campaign DTO
export class UpdateCampaignDto {
  @ApiProperty({ description: 'Campaign title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Campaign objective', required: false })
  @IsString()
  @IsOptional()
  objective?: string;

  @ApiProperty({ description: 'Campaign description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Campaign budget', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @ApiProperty({ description: 'Campaign start date', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Campaign end date', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Maximum number of influencers needed', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxInfluencers?: number;

  @ApiProperty({ description: 'Target audience criteria', required: false })
  @IsObject()
  @IsOptional()
  targetCriteria?: object;

  @ApiProperty({ description: 'Campaign requirements', required: false })
  @IsObject()
  @IsOptional()
  requirements?: object;

  // Approval Settings
  @ApiProperty({ 
    description: 'Whether content submissions require approval before posting',
    required: false
  })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiProperty({ 
    description: 'List of influencer IDs that are auto-approved for this campaign',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  autoApproveInfluencers?: string[];

  @ApiProperty({ 
    description: 'Instructions for content approval process',
    required: false
  })
  @IsString()
  @IsOptional()
  approvalInstructions?: string;
}

// Campaign Status Update DTO
export class UpdateCampaignStatusDto {
  @ApiProperty({ description: 'New campaign status', enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  status: CampaignStatus;
}

// Campaign Filter DTO for Browse/Search
export class CampaignFilterDto {
  @ApiProperty({ description: 'Search term', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Campaign status filter', required: false })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiProperty({ description: 'Minimum budget', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minBudget?: number;

  @ApiProperty({ description: 'Maximum budget', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxBudget?: number;

  @ApiProperty({ description: 'Page number', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number = 10;
}

// Campaign Application DTO
export class CreateCampaignApplicationDto {
  @ApiProperty({ description: 'Application message', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Proposed deliverables', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  proposedDeliverables?: string[];

  @ApiProperty({ description: 'Additional application data', required: false })
  @IsObject()
  @IsOptional()
  applicationData?: object;
}

// Application Status Update DTO
export class UpdateApplicationStatusDto {
  @ApiProperty({ description: 'Application status', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] })
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED'])
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  @ApiProperty({ description: 'Response message', required: false })
  @IsString()
  @IsOptional()
  message?: string;
}

// Published Post DTOs
export class CreatePublishedPostDto {
  @ApiProperty({ description: 'Content submission ID' })
  @IsString()
  contentId: string;

  @ApiProperty({ description: 'Social media platform' })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Live post URL' })
  @IsString()
  postUrl: string;

  @ApiProperty({ description: 'Post type', required: false })
  @IsString()
  @IsOptional()
  postType?: string;

  @ApiProperty({ description: 'When the post was published' })
  @IsDateString()
  publishedAt: string;
}

export class UpdatePublishedPostDto {
  @ApiProperty({ description: 'Live post URL', required: false })
  @IsString()
  @IsOptional()
  postUrl?: string;

  @ApiProperty({ description: 'Post type', required: false })
  @IsString()
  @IsOptional()
  postType?: string;

  @ApiProperty({ description: 'When the post was published', required: false })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;
}