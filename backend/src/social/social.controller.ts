import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { SocialService } from './social.service'
import {
  ConnectSocialAccountDto,
  OAuthCallbackDto,
  SocialAccountsResponseDto,
  SocialConnectionResultDto,
  SocialSyncResultDto,
} from './dto/social.dto'

@ApiTags('Social Media Integration')
@Controller('social')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('platforms')
  @ApiOperation({ summary: 'Get available social media platforms' })
  @ApiResponse({ status: 200, description: 'List of available platforms' })
  getPlatforms() {
    return {
      platforms: [
        {
          key: 'instagram',
          name: 'Instagram',
          description: 'Connect your Instagram account',
          icon: 'instagram',
        },
        {
          key: 'tiktok',
          name: 'TikTok',
          description: 'Connect your TikTok account',
          icon: 'tiktok',
        },
        {
          key: 'youtube',
          name: 'YouTube',
          description: 'Connect your YouTube channel',
          icon: 'youtube',
        },
        {
          key: 'twitter',
          name: 'Twitter/X',
          description: 'Connect your Twitter account',
          icon: 'twitter',
        },
      ],
    }
  }

  @Get('oauth/:platform')
  @ApiOperation({ summary: 'Initiate OAuth flow for a platform' })
  @ApiResponse({ status: 200, description: 'OAuth authorization URL' })
  initiateOAuth(
    @Param('platform') platform: string,
    @Query('redirect_uri') redirectUri?: string,
    @Query('state') state?: string,
  ) {
    if (!redirectUri) {
      redirectUri = `${process.env.FRONTEND_URL}/auth/callback`
    }

    const authUrl = this.socialService.getOAuthUrl(platform, redirectUri, state)

    return {
      authUrl,
      platform,
      redirectUri,
    }
  }

  @Post('oauth/callback')
  @ApiOperation({ summary: 'Handle OAuth callback and connect account' })
  @ApiResponse({ 
    status: 200, 
    description: 'Account connected successfully',
    type: SocialConnectionResultDto,
  })
  async handleOAuthCallback(
    @Request() req,
    @Body() callbackData: OAuthCallbackDto,
    @Query('redirect_uri') redirectUri?: string,
  ): Promise<SocialConnectionResultDto> {
    const userId = req.user.id

    if (!redirectUri) {
      redirectUri = `${process.env.FRONTEND_URL}/auth/callback`
    }

    return this.socialService.handleOAuthCallback(
      userId,
      callbackData.platform,
      callbackData.code,
      redirectUri,
    )
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get connected social media accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of connected accounts',
    type: SocialAccountsResponseDto,
  })
  async getConnectedAccounts(@Request() req): Promise<SocialAccountsResponseDto> {
    const userId = req.user.id
    const accounts = await this.socialService.getConnectedAccounts(userId)
    
    return { accounts }
  }

  @Delete('accounts/:platform')
  @ApiOperation({ summary: 'Disconnect a social media account' })
  @ApiResponse({ status: 200, description: 'Account disconnected successfully' })
  async disconnectAccount(
    @Request() req,
    @Param('platform') platform: string,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user.id
    const success = await this.socialService.disconnectAccount(userId, platform)
    
    return {
      success,
      message: success 
        ? `${platform} account disconnected successfully`
        : `Failed to disconnect ${platform} account`,
    }
  }

  @Post('accounts/:platform/sync')
  @ApiOperation({ summary: 'Refresh metrics for a specific platform' })
  @ApiResponse({
    status: 200,
    description: 'Metrics refreshed successfully',
    type: SocialSyncResultDto,
  })
  async syncPlatformMetrics(
    @Request() req,
    @Param('platform') platform: string,
  ): Promise<SocialSyncResultDto> {
    const userId = req.user.id
    return this.socialService.syncPlatformMetrics(userId, platform)
  }

  @Post('accounts/sync-all')
  @ApiOperation({ summary: 'Refresh metrics for all connected accounts' })
  @ApiResponse({
    status: 200,
    description: 'All metrics refreshed',
    type: SocialSyncResultDto,
  })
  async syncAllMetrics(@Request() req): Promise<SocialSyncResultDto> {
    const userId = req.user.id
    return this.socialService.syncAllMetrics(userId)
  }

  @Get('accounts/:platform/status')
  @ApiOperation({ summary: 'Check if platform connection is still valid' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async checkConnectionStatus(
    @Request() req,
    @Param('platform') platform: string,
  ): Promise<{ platform: string; isValid: boolean }> {
    const userId = req.user.id
    const isValid = await this.socialService.checkConnectionStatus(userId, platform)
    
    return {
      platform,
      isValid,
    }
  }

  // Mock OAuth connection for development/testing
  @Post('mock-connect/:platform')
  @ApiOperation({ summary: '[DEV] Mock OAuth connection for testing' })
  @ApiResponse({
    status: 200,
    description: 'Mock connection created',
    type: SocialConnectionResultDto,
  })
  async mockConnect(
    @Request() req,
    @Param('platform') platform: string,
  ): Promise<SocialConnectionResultDto> {
    const userId = req.user.id
    
    // Generate mock OAuth callback data
    const mockCode = `mock_code_${platform}_${Date.now()}`
    const redirectUri = `${process.env.FRONTEND_URL}/auth/callback`
    
    return this.socialService.handleOAuthCallback(userId, platform, mockCode, redirectUri)
  }
}