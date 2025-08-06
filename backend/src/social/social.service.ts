import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { ConnectSocialAccountDto, SocialConnectionResultDto, SocialMetricsDto, ConnectedSocialAccountDto, SocialSyncResultDto } from './dto/social.dto'

interface PlatformConfig {
  name: string
  oauthUrl: string
  tokenUrl: string
  apiUrl: string
  scopes: string[]
  clientId: string
  clientSecret: string
}

@Injectable()
export class SocialService {
  private readonly platforms: Record<string, PlatformConfig>

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.platforms = {
      instagram: {
        name: 'Instagram',
        oauthUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        apiUrl: 'https://graph.instagram.com',
        scopes: ['user_profile', 'user_media'],
        clientId: this.configService.get('INSTAGRAM_CLIENT_ID') || '',
        clientSecret: this.configService.get('INSTAGRAM_CLIENT_SECRET') || '',
      },
      tiktok: {
        name: 'TikTok',
        oauthUrl: 'https://www.tiktok.com/auth/authorize/',
        tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
        apiUrl: 'https://open-api.tiktok.com',
        scopes: ['user.info.basic', 'user.info.stats'],
        clientId: this.configService.get('TIKTOK_CLIENT_ID') || '',
        clientSecret: this.configService.get('TIKTOK_CLIENT_SECRET') || '',
      },
      youtube: {
        name: 'YouTube',
        oauthUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        apiUrl: 'https://www.googleapis.com/youtube/v3',
        scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
        clientId: this.configService.get('GOOGLE_CLIENT_ID') || '',
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET') || '',
      },
      twitter: {
        name: 'Twitter/X',
        oauthUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        apiUrl: 'https://api.twitter.com/2',
        scopes: ['tweet.read', 'users.read', 'follows.read'],
        clientId: this.configService.get('TWITTER_CLIENT_ID') || '',
        clientSecret: this.configService.get('TWITTER_CLIENT_SECRET') || '',
      },
    }
  }

  // Get OAuth authorization URL for a platform
  getOAuthUrl(platform: string, redirectUri: string, state?: string): string {
    const config = this.platforms[platform]
    if (!config) {
      throw new BadRequestException(`Unsupported platform: ${platform}`)
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      ...(state && { state }),
    })

    return `${config.oauthUrl}?${params.toString()}`
  }

  // Handle OAuth callback and connect account
  async handleOAuthCallback(userId: string, platform: string, code: string, redirectUri: string): Promise<SocialConnectionResultDto> {
    try {
      const config = this.platforms[platform]
      if (!config) {
        throw new BadRequestException(`Unsupported platform: ${platform}`)
      }

      // Exchange code for access token
      const tokenData = await this.exchangeCodeForToken(platform, code, redirectUri)
      
      // Fetch user data and metrics
      const userData = await this.fetchUserData(platform, tokenData.access_token)
      
      // Save/update social account
      const socialAccount = await this.prisma.socialAccount.upsert({
        where: {
          userId_platform: {
            userId,
            platform,
          },
        },
        create: {
          userId,
          platform,
          platformUserId: userData.id,
          username: userData.username,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          followersCount: userData.metrics.followers,
          followingCount: userData.metrics.following,
          postsCount: userData.metrics.posts,
          engagementRate: userData.metrics.engagementRate,
          isVerified: userData.metrics.isVerified,
          isConnected: true,
          lastSynced: new Date(),
        },
        update: {
          platformUserId: userData.id,
          username: userData.username,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          followersCount: userData.metrics.followers,
          followingCount: userData.metrics.following,
          postsCount: userData.metrics.posts,
          engagementRate: userData.metrics.engagementRate,
          isVerified: userData.metrics.isVerified,
          isConnected: true,
          lastSynced: new Date(),
        },
      })

      const connectedAccount: ConnectedSocialAccountDto = {
        platform: socialAccount.platform,
        platformUserId: socialAccount.platformUserId || '',
        username: socialAccount.username || '',
        metrics: {
          followers: Number(socialAccount.followersCount),
          following: Number(socialAccount.followingCount),
          posts: Number(socialAccount.postsCount),
          engagementRate: Number(socialAccount.engagementRate || 0),
          isVerified: socialAccount.isVerified,
          lastSynced: socialAccount.lastSynced || new Date(),
        },
        isConnected: socialAccount.isConnected,
      }

      return {
        success: true,
        account: connectedAccount,
      }
    } catch (error) {
      console.error(`OAuth callback error for ${platform}:`, error)
      return {
        success: false,
        error: `Failed to connect ${platform}: ${error.message}`,
      }
    }
  }

  // Get connected social accounts for a user
  async getConnectedAccounts(userId: string): Promise<ConnectedSocialAccountDto[]> {
    // Try Redis cache first
    const cacheKey = `social:accounts:${userId}`
    const cachedAccounts = await this.cacheManager.get<ConnectedSocialAccountDto[]>(cacheKey)
    
    if (cachedAccounts) {
      console.log(`📦 Retrieved social accounts from cache for user ${userId}`)
      return cachedAccounts
    }

    // If not in cache, fetch from database
    const socialAccounts = await this.prisma.socialAccount.findMany({
      where: {
        userId,
        isConnected: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const accounts = socialAccounts.map(account => ({
      platform: account.platform,
      platformUserId: account.platformUserId || '',
      username: account.username || '',
      metrics: {
        followers: Number(account.followersCount),
        following: Number(account.followingCount),
        posts: Number(account.postsCount),
        engagementRate: Number(account.engagementRate || 0),
        isVerified: account.isVerified,
        lastSynced: account.lastSynced || new Date(),
      },
      isConnected: account.isConnected,
    }))

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, accounts, 5 * 60 * 1000)
    console.log(`💾 Cached social accounts for user ${userId}`)

    return accounts
  }

  // Disconnect a social account
  async disconnectAccount(userId: string, platform: string): Promise<boolean> {
    try {
      await this.prisma.socialAccount.updateMany({
        where: {
          userId,
          platform,
        },
        data: {
          isConnected: false,
          accessToken: null,
          refreshToken: null,
        },
      })

      // Invalidate cache
      await this.invalidateUserCache(userId)
      
      return true
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error)
      return false
    }
  }

  // Sync metrics for a specific platform
  async syncPlatformMetrics(userId: string, platform: string): Promise<SocialSyncResultDto> {
    try {
      const socialAccount = await this.prisma.socialAccount.findUnique({
        where: {
          userId_platform: {
            userId,
            platform,
          },
        },
      })

      if (!socialAccount || !socialAccount.isConnected || !socialAccount.accessToken) {
        return {
          success: false,
          message: `${platform} account not connected`,
        }
      }

      // Fetch updated metrics from platform API
      const userData = await this.fetchUserData(platform, socialAccount.accessToken)
      
      // Update metrics in database
      const updatedAccount = await this.prisma.socialAccount.update({
        where: {
          userId_platform: {
            userId,
            platform,
          },
        },
        data: {
          followersCount: userData.metrics.followers,
          followingCount: userData.metrics.following,
          postsCount: userData.metrics.posts,
          engagementRate: userData.metrics.engagementRate,
          isVerified: userData.metrics.isVerified,
          lastSynced: new Date(),
        },
      })

      // Invalidate cache
      await this.invalidateUserCache(userId)

      return {
        success: true,
        message: `${platform} metrics updated successfully`,
        updatedMetrics: {
          followers: Number(updatedAccount.followersCount),
          following: Number(updatedAccount.followingCount),
          posts: Number(updatedAccount.postsCount),
          engagementRate: Number(updatedAccount.engagementRate || 0),
          isVerified: updatedAccount.isVerified,
          lastSynced: updatedAccount.lastSynced || new Date(),
        },
      }
    } catch (error) {
      console.error(`Failed to sync ${platform} metrics:`, error)
      return {
        success: false,
        message: `Failed to sync ${platform} metrics: ${error.message}`,
      }
    }
  }

  // Sync all connected accounts for a user
  async syncAllMetrics(userId: string): Promise<SocialSyncResultDto> {
    try {
      const connectedAccounts = await this.prisma.socialAccount.findMany({
        where: {
          userId,
          isConnected: true,
        },
      })

      let successCount = 0
      let totalCount = connectedAccounts.length

      for (const account of connectedAccounts) {
        const result = await this.syncPlatformMetrics(userId, account.platform)
        if (result.success) successCount++
      }

      return {
        success: successCount > 0,
        message: `Synced ${successCount}/${totalCount} accounts successfully`,
      }
    } catch (error) {
      console.error('Failed to sync all metrics:', error)
      return {
        success: false,
        message: `Failed to sync metrics: ${error.message}`,
      }
    }
  }

  // Check if a platform connection is still valid
  async checkConnectionStatus(userId: string, platform: string): Promise<boolean> {
    try {
      const socialAccount = await this.prisma.socialAccount.findUnique({
        where: {
          userId_platform: {
            userId,
            platform,
          },
        },
      })

      if (!socialAccount || !socialAccount.isConnected || !socialAccount.accessToken) {
        return false
      }

      // Test API call to check token validity
      try {
        await this.fetchUserData(platform, socialAccount.accessToken)
        return true
      } catch (error) {
        // Token is invalid, mark as disconnected
        await this.prisma.socialAccount.update({
          where: {
            userId_platform: {
              userId,
              platform,
            },
          },
          data: {
            isConnected: false,
          },
        })
        return false
      }
    } catch (error) {
      console.error(`Failed to check ${platform} connection:`, error)
      return false
    }
  }

  // Private helper methods

  private async exchangeCodeForToken(platform: string, code: string, redirectUri: string): Promise<any> {
    const config = this.platforms[platform]
    
    // For now, return mock token data
    // In production, make actual API calls to exchange code for tokens
    return {
      access_token: `mock_${platform}_token_${Date.now()}`,
      refresh_token: `mock_${platform}_refresh_${Date.now()}`,
      expires_in: 3600,
    }
  }

  private async fetchUserData(platform: string, accessToken: string): Promise<any> {
    // Mock user data for now
    // In production, make actual API calls to fetch user data and metrics
    const mockData = {
      id: `mock_${platform}_${Date.now()}`,
      username: `user_${platform}_${Math.floor(Math.random() * 1000)}`,
      metrics: {
        followers: Math.floor(Math.random() * 50000) + 1000,
        following: Math.floor(Math.random() * 1000) + 100,
        posts: Math.floor(Math.random() * 500) + 50,
        engagementRate: Math.random() * 10 + 2,
        isVerified: Math.random() > 0.8,
      },
    }

    return mockData
  }

  // Cache helper methods
  private async invalidateUserCache(userId: string): Promise<void> {
    const cacheKey = `social:accounts:${userId}`
    await this.cacheManager.del(cacheKey)
    console.log(`🗑️ Invalidated cache for user ${userId}`)
  }

  private async getCachedMetrics(userId: string, platform: string): Promise<SocialMetricsDto | null> {
    const cacheKey = `social:metrics:${userId}:${platform}`
    return await this.cacheManager.get<SocialMetricsDto>(cacheKey)
  }

  private async setCachedMetrics(userId: string, platform: string, metrics: SocialMetricsDto, ttl: number = 15 * 60 * 1000): Promise<void> {
    const cacheKey = `social:metrics:${userId}:${platform}`
    await this.cacheManager.set(cacheKey, metrics, ttl)
    console.log(`💾 Cached metrics for ${platform} - user ${userId}`)
  }
}