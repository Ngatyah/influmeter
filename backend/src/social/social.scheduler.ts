import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { SocialService } from './social.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SocialScheduler {
  private readonly logger = new Logger(SocialScheduler.name)

  constructor(
    private readonly socialService: SocialService,
    private readonly prisma: PrismaService,
  ) {}

  // Test scheduler with simple log
  @Cron(CronExpression.EVERY_HOUR)
  async testScheduler() {
    this.logger.log('✅ Social scheduler is working!')
  }

  // Sync all connected social accounts every hour
  @Cron(CronExpression.EVERY_HOUR)
  async syncAllSocialMetrics() {
    this.logger.log('🔄 Starting scheduled social metrics sync...')

    try {
      // Get all users with connected social accounts
      const usersWithSocialAccounts = await this.prisma.socialAccount.findMany({
        where: {
          isConnected: true,
        },
        select: {
          userId: true,
          platform: true,
        },
        distinct: ['userId'],
      })

      this.logger.log(`📊 Found ${usersWithSocialAccounts.length} users with connected accounts`)

      let successCount = 0
      let errorCount = 0

      // Sync metrics for each user
      for (const { userId } of usersWithSocialAccounts) {
        try {
          const result = await this.socialService.syncAllMetrics(userId)
          if (result.success) {
            successCount++
          } else {
            errorCount++
            this.logger.warn(`❌ Failed to sync metrics for user ${userId}: ${result.message}`)
          }
        } catch (error) {
          errorCount++
          this.logger.error(`❌ Error syncing metrics for user ${userId}:`, error)
        }
      }

      this.logger.log(`✅ Sync completed: ${successCount} successful, ${errorCount} errors`)
    } catch (error) {
      this.logger.error('❌ Failed to run scheduled metrics sync:', error)
    }
  }

  // Sync high-engagement accounts more frequently (every 15 minutes)
  @Cron('*/15 * * * *')
  async syncHighEngagementAccounts() {
    this.logger.log('🚀 Syncing high-engagement social accounts...')

    try {
      // Get accounts with high engagement (>5%) or high follower count (>10k)
      const highEngagementAccounts = await this.prisma.socialAccount.findMany({
        where: {
          isConnected: true,
          OR: [
            { engagementRate: { gt: 5.0 } },
            { followersCount: { gt: 10000 } },
          ],
        },
        select: {
          userId: true,
          platform: true,
          followersCount: true,
          engagementRate: true,
        },
      })

      this.logger.log(`🔥 Found ${highEngagementAccounts.length} high-engagement accounts`)

      for (const account of highEngagementAccounts) {
        try {
          await this.socialService.syncPlatformMetrics(account.userId, account.platform)
        } catch (error) {
          this.logger.warn(`⚠️ Failed to sync ${account.platform} for user ${account.userId}:`, error)
        }
      }
    } catch (error) {
      this.logger.error('❌ Failed to sync high-engagement accounts:', error)
    }
  }

  // Clean up expired tokens daily at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredTokens() {
    this.logger.log('🧹 Cleaning up expired social media tokens...')

    try {
      // Check connection status for all accounts and mark invalid ones as disconnected
      const connectedAccounts = await this.prisma.socialAccount.findMany({
        where: {
          isConnected: true,
        },
        select: {
          userId: true,
          platform: true,
        },
      })

      let cleanedUp = 0

      for (const account of connectedAccounts) {
        try {
          const isValid = await this.socialService.checkConnectionStatus(
            account.userId,
            account.platform,
          )

          if (!isValid) {
            cleanedUp++
          }
        } catch (error) {
          this.logger.warn(`⚠️ Error checking ${account.platform} status for user ${account.userId}:`, error)
        }
      }

      this.logger.log(`🗑️ Cleaned up ${cleanedUp} expired social media connections`)
    } catch (error) {
      this.logger.error('❌ Failed to clean up expired tokens:', error)
    }
  }

  // Log sync statistics daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async logSyncStatistics() {
    this.logger.log('📈 Generating daily social media sync statistics...')

    try {
      const stats = await this.prisma.socialAccount.groupBy({
        by: ['platform'],
        where: {
          isConnected: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          followersCount: true,
          engagementRate: true,
        },
      })

      this.logger.log('📊 Social Media Platform Statistics:')
      for (const stat of stats) {
        this.logger.log(
          `  ${stat.platform}: ${stat._count.id} accounts, ` +
          `avg ${Math.round(Number(stat._avg.followersCount) || 0)} followers, ` +
          `${(Number(stat._avg.engagementRate) || 0).toFixed(2)}% engagement`,
        )
      }

      // Log total metrics
      const totalAccounts = await this.prisma.socialAccount.count({
        where: { isConnected: true },
      })

      const totalUsers = await this.prisma.user.count({
        where: {
          socialAccounts: {
            some: { isConnected: true },
          },
        },
      })

      this.logger.log(`📋 Total: ${totalAccounts} connected accounts across ${totalUsers} users`)
    } catch (error) {
      this.logger.error('❌ Failed to generate sync statistics:', error)
    }
  }
}