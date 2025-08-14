import { IsString, IsEmail, IsOptional, IsNumber, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({ description: 'Influencer user ID' })
  @IsString()
  @IsUUID()
  influencerId: string;

  @ApiProperty({ description: 'Package ID being inquired about' })
  @IsString()
  @IsUUID()
  packageId: string;

  @ApiProperty({ description: 'Company/Brand name' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Contact person name' })
  @IsString()
  contactName: string;

  @ApiProperty({ description: 'Contact email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Inquiry message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Budget range' })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ description: 'Timeline requirements' })
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiProperty({ description: 'Package details snapshot' })
  @IsObject()
  packageDetails: {
    platform: string;
    type: string;
    price: number;
    title?: string;
  };
}

export class UpdateInquiryStatusDto {
  @ApiProperty({ 
    description: 'Inquiry status',
    enum: ['PENDING', 'CONTACTED', 'NEGOTIATING', 'ACCEPTED', 'DECLINED', 'COMPLETED']
  })
  @IsString()
  status: 'PENDING' | 'CONTACTED' | 'NEGOTIATING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';

  @ApiPropertyOptional({ description: 'Response message' })
  @IsOptional()
  @IsString()
  response?: string;
}