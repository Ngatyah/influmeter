import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscoverInfluencersDto } from './dto/discover.dto';
import { convertBigIntsToNumbers } from '../common/utils/bigint.util';

@Injectable()
export class DiscoverService {
  constructor(private prisma: PrismaService) {}

  async discoverInfluencers(filters: DiscoverInfluencersDto) {
    const {
      search,
      minFollowers,
      maxFollowers,
      locations,
      niches,
      platforms,
      engagementMin,
      verified,
      page = 1,
      limit = 12,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      role: 'INFLUENCER',
      // Only show users who have completed onboarding
      onboardingProgress: {
        isCompleted: true,
      },
    };

    // Search by name or bio
    if (search) {
      where.OR = [
        {
          profile: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { bio: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          influencerProfile: {
            categories: {
              hasSome: [search],
            },
          },
        },
      ];
    }

    // Filter by verification status
    if (verified) {
      where.profile = {
        ...where.profile,
        isVerified: true,
      };
    }

    // Filter by location
    if (locations) {
      const locationArray = locations.split(',').map(loc => loc.trim());
      where.profile = {
        ...where.profile,
        location: {
          in: locationArray,
        },
      };
    }

    // Filter by niches/categories
    if (niches) {
      const nicheArray = niches.split(',').map(niche => niche.trim());
      where.influencerProfile = {
        ...where.influencerProfile,
        categories: {
          hasSome: nicheArray,
        },
      };
    }

    // Filter by platforms
    if (platforms) {
      const platformArray = platforms.split(',').map(platform => platform.trim());
      where.socialAccounts = {
        some: {
          platform: {
            in: platformArray,
          },
        },
      };
    }

    // Filter by follower count
    if (minFollowers !== undefined || maxFollowers !== undefined) {
      const followerFilter: any = {};
      if (minFollowers !== undefined) followerFilter.gte = minFollowers;
      if (maxFollowers !== undefined) followerFilter.lte = maxFollowers;
      
      where.socialAccounts = {
        ...where.socialAccounts,
        some: {
          ...where.socialAccounts?.some,
          followersCount: followerFilter,
        },
      };
    }

    // Filter by engagement rate
    if (engagementMin !== undefined) {
      where.socialAccounts = {
        ...where.socialAccounts,
        some: {
          ...where.socialAccounts?.some,
          engagementRate: {
            gte: engagementMin,
          },
        },
      };
    }

    // Execute query
    const [influencers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: true,
          influencerProfile: true,
          socialAccounts: {
            orderBy: {
              followersCount: 'desc',
            },
          },
        },
        orderBy: [
          {
            socialAccounts: {
              _count: 'desc',
            },
          },
          {
            profile: {
              isVerified: 'desc',
            },
          },
        ],
      }),
      this.prisma.user.count({ where }),
    ]);

    // Transform data to match frontend expectations
    const transformedInfluencers = influencers.map(user => {
      const primarySocial = user.socialAccounts[0];
      const totalFollowers = user.socialAccounts.reduce(
        (sum, account) => sum + Number(account.followersCount || 0), 
        0
      );
      
      // Calculate average engagement rate
      const avgEngagement = user.socialAccounts.length > 0
        ? user.socialAccounts.reduce((sum, account) => sum + Number(account.engagementRate || 0), 0) / user.socialAccounts.length
        : 0;

      return {
        id: user.id,
        name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Unknown',
        username: `@${user.profile?.firstName?.toLowerCase() || 'user'}`,
        avatar: user.profile?.avatarUrl || '/api/placeholder/100/100',
        bio: user.profile?.bio || user.influencerProfile?.categories?.join(', ') || 'No bio available',
        followers: this.formatNumber(totalFollowers),
        engagement: `${avgEngagement.toFixed(1)}%`,
        location: user.profile?.location || 'Location not specified',
        niches: user.influencerProfile?.categories || [],
        platforms: user.socialAccounts.map(account => ({
          platform: account.platform,
          followers: this.formatNumber(Number(account.followersCount || 0)),
        })),
        avgViews: this.formatNumber(Math.floor(totalFollowers * (avgEngagement / 100))),
        isVerified: user.profile?.isVerified || false,
        isShortlisted: false, // TODO: Implement shortlist functionality
        rating: 4.5, // TODO: Implement rating system
        priceRange: this.getPriceRange(totalFollowers),
      };
    });

    return {
      influencers: convertBigIntsToNumbers(transformedInfluencers),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  private getPriceRange(followers: number): string {
    if (followers >= 1000000) return '$1000-3000';
    if (followers >= 500000) return '$500-1500';
    if (followers >= 100000) return '$200-800';
    if (followers >= 50000) return '$100-400';
    if (followers >= 10000) return '$50-200';
    return '$25-100';
  }
}