import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class SocialMetricsDto {
  @ApiProperty()
  @IsNumber()
  followers: number

  @ApiProperty()
  @IsNumber()
  following: number

  @ApiProperty()
  @IsNumber()
  posts: number

  @ApiProperty()
  @IsNumber()
  engagementRate: number

  @ApiProperty()
  @IsBoolean()
  isVerified: boolean

  @ApiProperty()
  lastSynced: Date
}

export class ConnectedSocialAccountDto {
  @ApiProperty()
  @IsString()
  platform: string

  @ApiProperty()
  @IsString()
  platformUserId: string

  @ApiProperty()
  @IsString()
  username: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accessToken?: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => SocialMetricsDto)
  metrics: SocialMetricsDto

  @ApiProperty()
  @IsBoolean()
  isConnected: boolean
}

export class ConnectSocialAccountDto {
  @ApiProperty()
  @IsString()
  platform: string

  @ApiProperty()
  @IsString()
  platformUserId: string

  @ApiProperty()
  @IsString()
  username: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accessToken?: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => SocialMetricsDto)
  metrics: SocialMetricsDto
}

export class OAuthCallbackDto {
  @ApiProperty()
  @IsString()
  platform: string

  @ApiProperty()
  @IsString()
  code: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string
}

export class SocialAccountsResponseDto {
  @ApiProperty({ type: [ConnectedSocialAccountDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectedSocialAccountDto)
  accounts: ConnectedSocialAccountDto[]
}

export class SocialConnectionResultDto {
  @ApiProperty()
  @IsBoolean()
  success: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectedSocialAccountDto)
  account?: ConnectedSocialAccountDto

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  error?: string
}

export class SocialSyncResultDto {
  @ApiProperty()
  @IsBoolean()
  success: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMetricsDto)
  updatedMetrics?: SocialMetricsDto
}