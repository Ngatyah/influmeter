import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getBrandDashboard(userId: string) {
    const [campaignsCount, activeCampaignsCount, totalContentSubmissions] =
      await Promise.all([
        this.prisma.campaign.count({ where: { brandId: userId } }),
        this.prisma.campaign.count({
          where: { brandId: userId, status: 'ACTIVE' },
        }),
        this.prisma.contentSubmission.count({
          where: {
            campaign: { brandId: userId },
          },
        }),
      ]);

    const topInfluencers = await this.prisma.user.findMany({
      where: {
        role: 'INFLUENCER',
        campaignParticipants: {
          some: {
            campaign: {
              brandId: userId,
            },
          },
        },
      },
      include: {
        profile: true,
        _count: {
          select: {
            contentSubmissions: true,
          },
        },
      },
      orderBy: {
        contentSubmissions: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    return {
      totalCampaigns: campaignsCount,
      activeCampaigns: activeCampaignsCount,
      totalContentSubmissions,
      topInfluencers: topInfluencers.map((influencer) => ({
        id: influencer.id,
        name: influencer.profile?.firstName + ' ' + influencer.profile?.lastName || 'Influencer',
        handle: influencer.email,
        profilePicture: influencer.profile?.avatarUrl,
        totalSubmissions: influencer._count.contentSubmissions,
      })),
    };
  }

  async getInfluencerDashboard(userId: string) {
    const [joinedCampaignsCount, submittedContentCount, totalEarnings] = await Promise.all([
      this.prisma.campaignParticipant.count({
        where: { influencerId: userId },
      }),
      this.prisma.contentSubmission.count({
        where: { influencerId: userId },
      }),
      this.prisma.userEarnings.findUnique({
        where: { userId },
      }),
    ]);

    const recentCampaigns = await this.prisma.campaign.findMany({
      where: {
        participants: {
          some: {
            influencerId: userId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      joinedCampaigns: joinedCampaignsCount,
      submittedContent: submittedContentCount,
      totalEarnings: totalEarnings?.totalEarned?.toNumber() || 0,
      pendingAmount: totalEarnings?.pendingAmount?.toNumber() || 0,
      recentCampaigns: recentCampaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      })),
    };
  }

  async getBrandCampaigns(userId: string) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { brandId: userId },
      include: {
        _count: {
          select: {
            participants: true,
            contentSubmissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      status: campaign.status,
      objective: campaign.objective,
      budget: campaign.budget?.toNumber(),
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      participantsCount: campaign._count.participants,
      contentCount: campaign._count.contentSubmissions,
      createdAt: campaign.createdAt,
    }));
  }

  async getInfluencerCampaigns(userId: string) {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        participants: {
          some: {
            influencerId: userId,
          },
        },
      },
      include: {
        brand: {
          include: {
            profile: true,
            brandProfile: true,
          },
        },
        participants: {
          where: {
            influencerId: userId,
          },
        },
        contentSubmissions: {
          where: {
            influencerId: userId,
          },
        },
        _count: {
          select: {
            participants: true,
            contentSubmissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      status: campaign.status,
      objective: campaign.objective,
      budget: campaign.budget?.toNumber(),
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      brand: {
        id: campaign.brand.id,
        name: campaign.brand.profile?.firstName + ' ' + campaign.brand.profile?.lastName || 'Brand',
        company: campaign.brand.brandProfile?.companyName || 'Company',
        logo: campaign.brand.brandProfile?.logoUrl,
      },
      participantStatus: campaign.participants[0]?.status || 'ACTIVE',
      myContentCount: campaign.contentSubmissions.length,
      totalParticipants: campaign._count.participants,
      totalContent: campaign._count.contentSubmissions,
      joinedAt: campaign.participants[0]?.joinedAt,
      createdAt: campaign.createdAt,
    }));
  }

  async getInfluencerEarnings(userId: string) {
    const [userEarnings, payments, contentSubmissions] = await Promise.all([
      // Get total earnings summary
      this.prisma.userEarnings.findUnique({
        where: { userId },
      }),
      
      // Get payment history
      this.prisma.payment.findMany({
        where: { influencerId: userId },
        include: {
          content: {
            include: {
              campaign: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10, // Latest 10 payments
      }),
      
      // Get content submissions for earnings calculation
      this.prisma.contentSubmission.findMany({
        where: { 
          influencerId: userId,
          status: { in: ['COMPLETED', 'PAID'] },
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    // Calculate earnings if userEarnings doesn't exist
    const totalEarned = contentSubmissions
      .filter(content => content.status === 'PAID')
      .reduce((sum, content) => sum + (content.amount?.toNumber() || 0), 0);
      
    const pendingAmount = contentSubmissions
      .filter(content => content.status === 'COMPLETED')
      .reduce((sum, content) => sum + (content.amount?.toNumber() || 0), 0);

    const totalPaid = payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.netAmount.toNumber(), 0);

    return {
      summary: {
        totalEarned: userEarnings?.totalEarned?.toNumber() || totalEarned,
        totalPaid: userEarnings?.totalPaid?.toNumber() || totalPaid,
        pendingAmount: userEarnings?.pendingAmount?.toNumber() || pendingAmount,
        lastPayoutAt: userEarnings?.lastPayoutAt,
      },
      recentPayments: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount.toNumber(),
        netAmount: payment.netAmount.toNumber(),
        platformFee: payment.platformFee.toNumber(),
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        processedAt: payment.processedAt,
        createdAt: payment.createdAt,
        campaign: payment.content?.campaign ? {
          id: payment.content.campaign.id,
          title: payment.content.campaign.title,
        } : null,
      })),
      contentEarnings: contentSubmissions.map((content) => ({
        id: content.id,
        title: content.title,
        amount: content.amount?.toNumber() || 0,
        status: content.status,
        submittedAt: content.submittedAt,
        completedAt: content.completedAt,
        paidAt: content.paidAt,
        campaign: {
          id: content.campaign.id,
          title: content.campaign.title,
        },
      })),
      monthlyEarnings: await this.getMonthlyEarnings(userId),
    };
  }

  // Helper method for monthly earnings chart
  private async getMonthlyEarnings(userId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await this.prisma.payment.groupBy({
      by: ['processedAt'],
      where: {
        influencerId: userId,
        status: 'COMPLETED',
        processedAt: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        netAmount: true,
      },
    });

    // Format data for chart
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthData = monthlyData.find(item => 
        item.processedAt?.toISOString().slice(0, 7) === monthKey
      );
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        earnings: monthData?._sum.netAmount?.toNumber() || 0,
      });
    }

    return months;
  }

  async getBrandAnalytics(userId: string) {
    const [campaigns, totalInfluencers, totalContentSubmissions, totalPayments] = await Promise.all([
      // Get all brand campaigns with metrics
      this.prisma.campaign.findMany({
        where: { brandId: userId },
        include: {
          participants: true,
          contentSubmissions: {
            include: {
              performance: true,
            },
          },
          analytics: true,
        },
      }),
      
      // Get unique influencers worked with
      this.prisma.campaignParticipant.groupBy({
        by: ['influencerId'],
        where: {
          campaign: {
            brandId: userId,
          },
        },
      }),
      
      // Get total content submissions
      this.prisma.contentSubmission.count({
        where: {
          campaign: {
            brandId: userId,
          },
        },
      }),
      
      // Get total payments made
      this.prisma.payment.aggregate({
        where: {
          brandId: userId,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    // Calculate performance metrics
  const totalReach = campaigns.reduce((sum, campaign) => {
  return sum + (Number(campaign.analytics?.totalReach) || 0);
}, 0);

const totalEngagement = campaigns.reduce((sum, campaign) => {
  return sum + (Number(campaign.analytics?.totalEngagement) || 0);
}, 0);

const totalImpressions = campaigns.reduce((sum, campaign) => {
  return sum + (Number(campaign.analytics?.totalImpressions) || 0);
}, 0);


    const avgEngagementRate = campaigns.length > 0 
      ? campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.engagementRate?.toNumber() || 0), 0) / campaigns.length
      : 0;

    // Get top performing campaigns
   const topCampaigns = campaigns
  .filter(campaign => campaign.analytics)
  .sort(
    (a, b) =>
      (Number(b.analytics?.totalEngagement) || 0) -
      (Number(a.analytics?.totalEngagement) || 0)
  )
  .slice(0, 5)
  .map(campaign => ({
    id: campaign.id,
    title: campaign.title,
    reach: Number(campaign.analytics?.totalReach) || 0,
    engagement: Number(campaign.analytics?.totalEngagement) || 0,
    engagementRate: Number(campaign.analytics?.engagementRate) || 0,
    participantsCount: campaign.participants.length,
    contentCount: campaign.contentSubmissions.length,
  }));

    return {
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
        totalInfluencers: totalInfluencers.length,
        totalContentSubmissions,
        totalReach,
        totalImpressions,
        totalEngagement,
        avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
        totalSpent: totalPayments._sum.amount?.toNumber() || 0,
        totalPayments: totalPayments._count,
      },
      topCampaigns,
      platformMetrics: await this.getPlatformBreakdown(userId),
      monthlyMetrics: await this.getMonthlyMetrics(userId),
      contentInsights: await this.getContentInsights(userId),
      roi: await this.calculateROI(userId),
    };
  }

  // Helper method for platform breakdown
  private async getPlatformBreakdown(userId: string) {
    const platformStats = {
      Instagram: { posts: 0, reach: 0, engagement: 0 },
      TikTok: { posts: 0, reach: 0, engagement: 0 },
      YouTube: { posts: 0, reach: 0, engagement: 0 },
    };

    return Object.entries(platformStats).map(([platform, stats]) => ({
      platform,
      posts: stats.posts,
      reach: stats.reach,
      engagement: stats.engagement,
      engagementRate: stats.reach > 0 ? (stats.engagement / stats.reach * 100) : 0,
    }));
  }

  // Helper method for monthly metrics
  private async getMonthlyMetrics(userId: string) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        campaigns: 0,
        reach: 0,
        engagement: 0,
      });
    }

    return months;
  }

  // Helper method for content insights
  private async getContentInsights(userId: string) {
    const topContent = await this.prisma.contentSubmission.findMany({
      where: {
        campaign: {
          brandId: userId,
        },
        status: { in: ['COMPLETED', 'PAID'] },
        performance: {
          isNot: null,
        },
      },
      include: {
        performance: true,
        influencer: {
          include: {
            profile: true,
          },
        },
        campaign: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        performance: {
          likes: 'desc',
        },
      },
      take: 10,
    });

    return topContent.map(content => ({
      id: content.id,
      title: content.title || 'Untitled',
      campaign: content.campaign.title,
      influencer: {
        name: content.influencer.profile?.firstName + ' ' + content.influencer.profile?.lastName,
      },
      performance: {
        views:content.performance?.views ? Number(content.performance.views) : 0,
        likes: content.performance?.likes? Number(content.performance.likes): 0,
        comments: content.performance?.comments? Number(content.performance.likes): 0,
        shares: content.performance?.shares? Number(content.performance.likes): 0 ,
        engagementRate: content.performance?.engagementRate?.toNumber() || 0,
      },
      submittedAt: content.submittedAt,
    }));
  }

  // Helper method for ROI calculation
  private async calculateROI(userId: string) {
    const [totalSpent, totalMetrics] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          brandId: userId,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
      
      this.prisma.campaignAnalytics.aggregate({
        where: {
          campaign: {
            brandId: userId,
          },
        },
        _sum: {
          totalReach: true,
          totalEngagement: true,
        },
      }),
    ]);

const engagement = totalMetrics._sum.totalEngagement ? Number(totalMetrics._sum.totalEngagement) : 0;
const reach = totalMetrics._sum.totalReach ? Number(totalMetrics._sum.totalReach) : 0;
const spent = totalSpent._sum.amount ? Number(totalSpent._sum.amount) : 0;


    return {
      totalSpent: spent,
      totalReach: reach,
      totalEngagement: engagement,
      costPerReach: reach > 0 ? spent / reach : 0,
      costPerEngagement: engagement > 0 ? spent / engagement : 0,
      engagementRate: reach > 0 ? (engagement / reach * 100) : 0,
    };
  }

  async getBrandPendingActions(userId: string) {
    const [pendingContentCount, pendingApplicationsCount] = await Promise.all([
      // Count pending content submissions
      this.prisma.contentSubmission.count({
        where: {
          campaign: {
            brandId: userId,
          },
          status: 'PENDING',
        },
      }),

      // Count pending campaign applications
      this.prisma.campaignApplication.count({
        where: {
          campaign: {
            brandId: userId,
          },
          status: 'PENDING',
        },
      }),
    ]);

    const actions = [];

    // Add pending content submissions action
    if (pendingContentCount > 0) {
      actions.push({
        id: 'content-submissions',
        text: `${pendingContentCount} content submission${pendingContentCount === 1 ? '' : 's'} to review`,
        action: 'Review',
        urgent: pendingContentCount > 3,
        actionUrl: '/content/approvals',
        count: pendingContentCount,
      });
    }

    // Add pending applications action
    if (pendingApplicationsCount > 0) {
      actions.push({
        id: 'campaign-applications',
        text: `${pendingApplicationsCount} campaign application${pendingApplicationsCount === 1 ? '' : 's'}`,
        action: 'View',
        urgent: pendingApplicationsCount > 5,
        actionUrl: '/campaigns',
        count: pendingApplicationsCount,
      });
    }

    // If no pending actions, add a placeholder
    if (actions.length === 0) {
      actions.push({
        id: 'all-clear',
        text: 'All caught up! No pending actions.',
        action: 'Create Campaign',
        urgent: false,
        actionUrl: '/campaigns/create',
        count: 0,
      });
    }

    return actions;
  }
}