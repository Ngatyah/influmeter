import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { CampaignStatus } from '@prisma/client'

@Injectable()
export class CampaignsScheduler {
  private readonly logger = new Logger(CampaignsScheduler.name)

  constructor(private readonly prisma: PrismaService) {}

  // Check for expired campaigns every hour
  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredCampaigns() {
    this.logger.log('🔍 Checking for expired campaigns...')

    try {
      const now = new Date()
      
      // Find campaigns that have passed their end date but are still active or paused
      const expiredCampaigns = await this.prisma.campaign.findMany({
        where: {
          endDate: {
            lt: now, // End date is less than current time
          },
          status: {
            in: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED], // Only active or paused campaigns
          },
        },
        select: {
          id: true,
          title: true,
          endDate: true,
          status: true,
          brand: {
            select: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              brandProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
      })

      if (expiredCampaigns.length === 0) {
        this.logger.log('✅ No expired campaigns found')
        return
      }

      this.logger.log(`⏰ Found ${expiredCampaigns.length} expired campaigns`)

      let completedCount = 0
      let errorCount = 0

      // Complete each expired campaign
      for (const campaign of expiredCampaigns) {
        try {
          await this.prisma.campaign.update({
            where: { id: campaign.id },
            data: { 
              status: CampaignStatus.COMPLETED,
              updatedAt: now,
            },
          })

          const brandName = campaign.brand?.brandProfile?.companyName || 
            `${campaign.brand?.profile?.firstName || ''} ${campaign.brand?.profile?.lastName || ''}`.trim() || 
            'Unknown Brand'

          this.logger.log(
            `✅ Auto-completed expired campaign: "${campaign.title}" by ${brandName} ` +
            `(ended: ${campaign.endDate?.toLocaleDateString()})`
          )
          
          completedCount++
        } catch (error) {
          this.logger.error(`❌ Failed to complete campaign ${campaign.id}:`, error)
          errorCount++
        }
      }

      this.logger.log(
        `🎯 Campaign expiry check completed: ${completedCount} campaigns auto-completed, ${errorCount} errors`
      )

      // Optional: Send notifications to brands about auto-completed campaigns
      if (completedCount > 0) {
        this.logger.log('📧 Consider sending notifications to brands about auto-completed campaigns')
      }

    } catch (error) {
      this.logger.error('❌ Failed to check expired campaigns:', error)
    }
  }

  // Daily summary of campaign statuses at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async logCampaignStatistics() {
    this.logger.log('📊 Generating daily campaign statistics...')

    try {
      const stats = await this.prisma.campaign.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      })

      this.logger.log('📈 Campaign Status Distribution:')
      for (const stat of stats) {
        this.logger.log(`  ${stat.status}: ${stat._count.id} campaigns`)
      }

      // Check campaigns ending soon (next 7 days)
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)

      const campaignsEndingSoon = await this.prisma.campaign.count({
        where: {
          endDate: {
            gte: new Date(),
            lte: weekFromNow,
          },
          status: {
            in: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED],
          },
        },
      })

      if (campaignsEndingSoon > 0) {
        this.logger.log(`⚠️ ${campaignsEndingSoon} campaigns ending within 7 days`)
      }

    } catch (error) {
      this.logger.error('❌ Failed to generate campaign statistics:', error)
    }
  }

  // Check campaigns that should start today (for future use)
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkCampaignsToStart() {
    this.logger.log('🚀 Checking campaigns scheduled to start today...')

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const campaignsToStart = await this.prisma.campaign.findMany({
        where: {
          startDate: {
            gte: today,
            lt: tomorrow,
          },
          status: CampaignStatus.DRAFT,
        },
        select: {
          id: true,
          title: true,
          startDate: true,
        },
      })

      if (campaignsToStart.length > 0) {
        this.logger.log(`📅 ${campaignsToStart.length} campaigns scheduled to start today`)
        // Note: Auto-activation of campaigns might need brand approval, so just log for now
        for (const campaign of campaignsToStart) {
          this.logger.log(`  - "${campaign.title}" (ID: ${campaign.id})`)
        }
      }

    } catch (error) {
      this.logger.error('❌ Failed to check campaigns to start:', error)
    }
  }
}