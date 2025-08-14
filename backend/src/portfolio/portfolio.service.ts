import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto } from './dto/portfolio.dto';
import { convertBigIntsToNumbers } from '../common/utils/bigint.util';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async getPortfolioByUserId(userId: string) {
    const portfolioItems = await this.prisma.portfolioItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return convertBigIntsToNumbers(portfolioItems);
  }

  async createPortfolioItem(userId: string, dto: CreatePortfolioItemDto) {
    const portfolioItem = await this.prisma.portfolioItem.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        brandName: dto.brandName,
        platform: dto.platform,
        contentType: dto.contentType,
        thumbnailUrl: dto.thumbnailUrl,
        postUrl: dto.postUrl,
        views: dto.views || 0,
        likes: dto.likes || 0,
        shares: dto.shares || 0,
        comments: dto.comments || 0,
        engagement: dto.engagement,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      },
    });

    return convertBigIntsToNumbers(portfolioItem);
  }

  async updatePortfolioItem(userId: string, id: string, dto: UpdatePortfolioItemDto) {
    // Check if the portfolio item belongs to the user
    const existing = await this.prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only update your own portfolio items');
    }

    const updateData: any = {};
    
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.brandName !== undefined) updateData.brandName = dto.brandName;
    if (dto.platform !== undefined) updateData.platform = dto.platform;
    if (dto.contentType !== undefined) updateData.contentType = dto.contentType;
    if (dto.thumbnailUrl !== undefined) updateData.thumbnailUrl = dto.thumbnailUrl;
    if (dto.postUrl !== undefined) updateData.postUrl = dto.postUrl;
    if (dto.views !== undefined) updateData.views = dto.views;
    if (dto.likes !== undefined) updateData.likes = dto.likes;
    if (dto.shares !== undefined) updateData.shares = dto.shares;
    if (dto.comments !== undefined) updateData.comments = dto.comments;
    if (dto.engagement !== undefined) updateData.engagement = dto.engagement;
    if (dto.publishedAt !== undefined) updateData.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;

    const updatedItem = await this.prisma.portfolioItem.update({
      where: { id },
      data: updateData,
    });

    return convertBigIntsToNumbers(updatedItem);
  }

  async deletePortfolioItem(userId: string, id: string) {
    // Check if the portfolio item belongs to the user
    const existing = await this.prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only delete your own portfolio items');
    }

    await this.prisma.portfolioItem.delete({
      where: { id },
    });

    return { message: 'Portfolio item deleted successfully' };
  }

  async getPublicPortfolioByUserId(userId: string) {
    // Get completed/paid content submissions with campaign data for public viewing
    const contentSubmissions = await this.prisma.contentSubmission.findMany({
      where: {
        influencerId: userId,
        status: {
          in: ['COMPLETED', 'PAID']
        }
      },
      include: {
        campaign: {
          include: {
            brand: {
              include: {
                profile: true,
                brandProfile: true
              }
            }
          }
        },
        publishedPosts: {
          include: {
            performance: true
          }
        },
        files: true,
        performance: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    // Transform the data to portfolio format
    const portfolioItems = contentSubmissions.map(content => {
      // Generate mock performance if not available
      const mockPerformance = this.generateMockPerformance(
        content.platforms?.[0] || 'Instagram', 
        content.contentType
      );

      // Process published posts
      const publishedPosts = content.publishedPosts?.map(post => ({
        platform: post.platform,
        postUrl: post.postUrl,
        postType: post.postType,
        publishedAt: post.publishedAt,
        status: post.status,
        performance: post.performance || mockPerformance
      })) || [];

      // Aggregate total performance
      const totalPerformance = this.aggregatePerformance(publishedPosts);

      return {
        id: content.id,
        campaignId: content.campaignId,
        contentId: content.id,
        title: content.campaign.title,
        brandName: content.campaign.brand?.brandProfile?.companyName || 
                  `${content.campaign.brand?.profile?.firstName || ''} ${content.campaign.brand?.profile?.lastName || ''}`.trim() ||
                  'Brand Name',
        brandLogo: content.campaign.brand?.brandProfile?.logoUrl,
        contentTitle: content.title,
        description: content.description,
        platform: content.platforms?.[0] || 'Instagram',
        contentType: content.contentType,
        status: content.status,
        amount: content.amount,
        submittedAt: content.submittedAt,
        completedAt: content.completedAt,
        paidAt: content.paidAt,
        publishedPosts,
        totalPerformance
      };
    });

    return convertBigIntsToNumbers(portfolioItems);
  }

  private generateMockPerformance(platform: string, contentType: string) {
    const platformMultipliers = {
      instagram: { views: 1.5, engagement: 1.2 },
      tiktok: { views: 3.0, engagement: 2.0 },
      youtube: { views: 5.0, engagement: 0.8 },
      twitter: { views: 0.8, engagement: 0.6 },
      facebook: { views: 1.0, engagement: 0.4 },
      linkedin: { views: 0.5, engagement: 0.8 }
    };

    const contentTypeMultipliers = {
      REEL: { views: 2.0, engagement: 1.5 },
      VIDEO: { views: 3.0, engagement: 1.3 },
      STORY: { views: 0.7, engagement: 1.8 },
      POST: { views: 1.0, engagement: 1.0 }
    };

    const platformMult = platformMultipliers[platform?.toLowerCase()] || { views: 1.0, engagement: 1.0 };
    const contentMult = contentTypeMultipliers[contentType] || { views: 1.0, engagement: 1.0 };

    const baseViews = Math.floor((Math.random() * 25000 + 5000) * platformMult.views * contentMult.views);
    const baseLikes = Math.floor(baseViews * 0.08 * platformMult.engagement * contentMult.engagement);
    const baseComments = Math.floor(baseLikes * 0.12);
    const baseShares = Math.floor(baseLikes * 0.05);
    
    return {
      views: baseViews,
      likes: baseLikes,
      comments: baseComments,
      shares: baseShares,
      saves: Math.floor(baseLikes * 0.15),
      impressions: Math.floor(baseViews * 1.8),
      reach: Math.floor(baseViews * 0.85),
      engagementRate: +((baseLikes + baseComments + baseShares) / baseViews * 100).toFixed(2),
      ctr: +(Math.random() * 2.5 + 0.5).toFixed(2),
      lastUpdated: new Date().toISOString()
    };
  }

  private aggregatePerformance(publishedPosts: any[]) {
    const totals = publishedPosts.reduce(
      (acc, post) => {
        const perf = post.performance || {};
        return {
          views: acc.views + (perf.views || 0),
          likes: acc.likes + (perf.likes || 0),
          comments: acc.comments + (perf.comments || 0),
          shares: acc.shares + (perf.shares || 0),
          saves: acc.saves + (perf.saves || 0),
          impressions: acc.impressions + (perf.impressions || 0),
          reach: acc.reach + (perf.reach || 0),
          engagementRates: [...acc.engagementRates, perf.engagementRate || 0]
        };
      },
      {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        impressions: 0,
        reach: 0,
        engagementRates: [] as number[]
      }
    );

    return {
      ...totals,
      avgEngagementRate: totals.engagementRates.length > 0
        ? +(totals.engagementRates.reduce((a, b) => a + b, 0) / totals.engagementRates.length).toFixed(2)
        : 0
    };
  }
}