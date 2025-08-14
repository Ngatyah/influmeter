import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto';
import { convertBigIntsToNumbers } from '../common/utils/bigint.util';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async createInquiry(dto: CreateInquiryDto, brandUserId?: string) {
    // Verify the influencer and package exist
    const [influencer, packageItem] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: dto.influencerId },
        include: { profile: true }
      }),
      this.prisma.influencerPackage.findFirst({
        where: { 
          id: dto.packageId,
          userId: dto.influencerId,
          isActive: true
        }
      })
    ]);

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (!packageItem) {
      throw new NotFoundException('Package not found or not available');
    }

    // Find or create brand user
    let brandUser;
    if (brandUserId) {
      brandUser = await this.prisma.user.findUnique({ where: { id: brandUserId } });
      if (!brandUser) {
        throw new NotFoundException('Brand user not found');
      }
    } else {
      // Check if a user with this email already exists
      brandUser = await this.prisma.user.findUnique({ 
        where: { email: dto.email },
        include: { profile: true, brandProfile: true }
      });

      if (!brandUser) {
        // Create a new brand user
        brandUser = await this.prisma.user.create({
          data: {
            email: dto.email,
            role: 'BRAND',
            emailVerified: false,
            profile: {
              create: {
                firstName: dto.contactName.split(' ')[0] || dto.contactName,
                lastName: dto.contactName.split(' ').slice(1).join(' ') || '',
              }
            },
            brandProfile: {
              create: {
                companyName: dto.companyName,
                contactName: dto.contactName,
              }
            }
          },
          include: { profile: true, brandProfile: true }
        });
      }
    }

    // Create the inquiry
    const inquiry = await this.prisma.inquiry.create({
      data: {
        brandId: brandUser.id,
        influencerId: dto.influencerId,
        packageId: dto.packageId,
        brandName: dto.companyName,
        subject: `Inquiry about ${packageItem.title || packageItem.packageType} package`,
        message: dto.message,
        brandEmail: dto.email,
        brandPhone: null,
        campaignBudget: dto.budget,
        timeline: dto.timeline,
        requirements: dto.packageDetails,
        status: 'PENDING'
      },
      include: {
        influencer: {
          include: {
            profile: true
          }
        },
        package: true
      }
    });

    // TODO: Send email notification to influencer
    // TODO: Create in-app notification

    return convertBigIntsToNumbers({
      ...inquiry,
      message: 'Inquiry sent successfully! The influencer will get back to you soon.'
    });
  }

  async getReceivedInquiries(
    influencerId: string,
    filters: { status?: string; page: number; limit: number }
  ) {
    const where: any = { influencerId };
    
    if (filters.status) {
      where.status = filters.status;
    }

    const [inquiries, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        include: {
          package: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.inquiry.count({ where })
    ]);

    return convertBigIntsToNumbers({
      inquiries,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
      hasMore: filters.page * filters.limit < total
    });
  }

  async getSentInquiries(
    email: string,
    filters: { status?: string; page: number; limit: number }
  ) {
    const where: any = { brandEmail: email };
    
    if (filters.status) {
      where.status = filters.status;
    }

    const [inquiries, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        include: {
          influencer: {
            include: {
              profile: true
            }
          },
          package: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.inquiry.count({ where })
    ]);

    return convertBigIntsToNumbers({
      inquiries,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
      hasMore: filters.page * filters.limit < total
    });
  }

  async getInquiry(id: string, userId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        influencer: {
          include: {
            profile: true
          }
        },
        package: true
      }
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    // Check if user has permission to view this inquiry
    const canView = inquiry.influencerId === userId || 
                   inquiry.brandEmail === (await this.prisma.user.findUnique({ where: { id: userId } }))?.email;

    if (!canView) {
      throw new ForbiddenException('You do not have permission to view this inquiry');
    }

    return convertBigIntsToNumbers(inquiry);
  }

  async updateInquiryStatus(id: string, userId: string, dto: UpdateInquiryStatusDto) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id }
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    // Only the influencer can update the inquiry status
    if (inquiry.influencerId !== userId) {
      throw new ForbiddenException('Only the influencer can update inquiry status');
    }

    const updatedInquiry = await this.prisma.inquiry.update({
      where: { id },
      data: {
        status: dto.status,
        brandResponse: dto.response,
        respondedAt: new Date()
      },
      include: {
        influencer: {
          include: {
            profile: true
          }
        },
        package: true
      }
    });

    // TODO: Send email notification to brand about status update
    // TODO: Create in-app notification

    return convertBigIntsToNumbers(updatedInquiry);
  }

  // Helper method to get inquiry statistics
  async getInquiryStats(influencerId: string) {
    const stats = await this.prisma.inquiry.groupBy({
      by: ['status'],
      where: { influencerId },
      _count: {
        status: true
      }
    });

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    const total = await this.prisma.inquiry.count({
      where: { influencerId }
    });

    return {
      total,
      byStatus: formattedStats
    };
  }
}