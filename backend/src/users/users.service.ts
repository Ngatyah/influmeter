import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { convertBigIntsToNumbers } from '../common/utils/bigint.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        onboardingProgress: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        influencerProfile: true,
        brandProfile: true,
        socialAccounts: true,
        onboardingProgress: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: data,
            update: data,
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async getInfluencerPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id,
        role: 'INFLUENCER', // Only return influencer profiles
      },
      include: {
        profile: true,
        influencerProfile: true,
        socialAccounts: {
          orderBy: {
            followersCount: 'desc',
          },
        },
        portfolioItems: {
          orderBy: {
            publishedAt: 'desc',
          },
          take: 12,
        },
        packages: {
          where: {
            isActive: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
        campaignParticipants: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'desc',
          },
          take: 10, // Last 10 campaigns
        },
        contentSubmissions: {
          where: {
            status: 'APPROVED',
          },
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                brand: {
                  select: {
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
            publishedPosts: true,
          },
          orderBy: {
            approvedAt: 'desc',
          },
          take: 12, // Portfolio items
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Influencer not found');
    }

    // Calculate performance metrics
    const totalFollowers = user.socialAccounts.reduce(
      (sum, account) => sum + Number(account.followersCount || 0), 
      0
    );

    const avgEngagement = user.socialAccounts.length > 0
      ? user.socialAccounts.reduce((sum, account) => sum + Number(account.engagementRate || 0), 0) / user.socialAccounts.length
      : 0;

    const totalCampaigns = user.campaignParticipants.length;
    const completedCampaigns = user.contentSubmissions.length;
    const completionRate = totalCampaigns > 0 ? (completedCampaigns / totalCampaigns) * 100 : 0;

    // Transform social media data
    const socialMedia = user.socialAccounts.reduce((acc, account) => {
      acc[account.platform.toLowerCase()] = {
        handle: account.username || `@${user.profile?.firstName?.toLowerCase() || 'user'}`,
        followers: Number(account.followersCount || 0),
        posts: Number(account.postsCount || 0),
        engagement: Number(account.engagementRate || 0),
      };
      return acc;
    }, {});

    // Transform portfolio data from actual portfolio items
    const portfolio = user.portfolioItems.map(item => ({
      id: item.id,
      title: item.title,
      brand: item.brandName,
      platform: item.platform,
      type: item.contentType,
      thumbnail: item.thumbnailUrl || '/api/placeholder/300/300',
      metrics: {
        views: Number(item.views || 0),
        likes: Number(item.likes || 0),
        engagement: Number(item.engagement || avgEngagement),
      },
      date: item.publishedAt || item.createdAt,
    }));

    // Transform packages data from actual packages
    const packages = user.packages.map(pkg => ({
      id: pkg.id,
      platform: pkg.platform,
      type: pkg.packageType,
      title: pkg.title,
      price: Number(pkg.price),
      deliverables: Array.isArray(pkg.deliverables) ? pkg.deliverables : [],
      turnaroundDays: pkg.turnaroundDays,
      revisions: pkg.revisions,
    }));

    const profileData = {
      id: user.id,
      name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Influencer',
      username: `@${user.profile?.firstName?.toLowerCase() || 'influencer'}`,
      avatar: user.profile?.avatarUrl || '/api/placeholder/150/150',
      coverImage: '/api/placeholder/800/300', // TODO: Add cover image field
      bio: user.profile?.bio || 'Content creator and influencer',
      location: user.profile?.location || 'Location not specified',
      verified: user.profile?.isVerified || false,
      joinedDate: user.createdAt,
      category: user.influencerProfile?.categories?.[0] || 'Content Creator',
      languages: ['English'], // TODO: Add languages field

      socialMedia,

      metrics: {
        totalReach: totalFollowers,
        avgEngagement: Math.round(avgEngagement * 10) / 10,
        totalCampaigns,
        completionRate: Math.round(completionRate),
        responseTime: '2 hours', // TODO: Calculate actual response time
        trustScore: Math.min(100, 70 + (completionRate * 0.3)), // Basic trust score calculation
      },

      packages,
      portfolio,
      
      // Mock reviews for now - TODO: Implement review system
      reviews: [],
    };

    return convertBigIntsToNumbers(profileData);
  }

  async updateBrandProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        brandProfile: {
          upsert: {
            create: data,
            update: data,
          },
        },
      },
      include: {
        profile: true,
        brandProfile: true,
      },
    });
  }

  async uploadLogo(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Update brand profile with logo URL
    const logoUrl = `/uploads/logos/${fileName}`;
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        brandProfile: {
          upsert: {
            create: { logoUrl },
            update: { logoUrl },
          },
        },
      },
      include: {
        profile: true,
        brandProfile: true,
      },
    });

    return {
      message: 'Logo uploaded successfully',
      logoUrl,
      user: updatedUser
    };
  }
}
