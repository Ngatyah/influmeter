import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  UpdateCampaignStatusDto,
  CampaignFilterDto,
  CreateCampaignApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/campaign.dto';
import { CampaignStatus } from '@prisma/client';
import { convertBigIntsToNumbers } from '../common/utils/bigint.util';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new campaign
  async create(brandId: string, createCampaignDto: CreateCampaignDto) {
    const campaign = await this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        brandId,
        startDate: createCampaignDto.startDate ? new Date(createCampaignDto.startDate) : null,
        endDate: createCampaignDto.endDate ? new Date(createCampaignDto.endDate) : null,
      },
      include: {
        brand: {
          include: {
            profile: true,
            brandProfile: true,
          },
        },
        _count: {
          select: {
            participants: true,
            applications: true,
            contentSubmissions: true,
          },
        },
      },
    });

    return campaign;
  }

  // Get all campaigns for a brand
  async findAllByBrand(brandId: string, filters?: CampaignFilterDto) {
    const {
      search,
      status,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10,
    } = filters || {};

    const skip = (page - 1) * limit;

    const where: any = {
      brandId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { objective: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (minBudget !== undefined || maxBudget !== undefined) {
      where.budget = {};
      if (minBudget !== undefined) where.budget.gte = minBudget;
      if (maxBudget !== undefined) where.budget.lte = maxBudget;
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: {
            include: {
              profile: true,
              brandProfile: true,
            },
          },
          _count: {
            select: {
              participants: true,
              applications: true,
              contentSubmissions: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      campaigns: convertBigIntsToNumbers(campaigns),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  // Browse campaigns for influencers
  async browse(filters?: CampaignFilterDto, userId?: string) {
    const {
      search,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10,
    } = filters || {};

    const skip = (page - 1) * limit;

    const where: any = {
      status: CampaignStatus.ACTIVE, // Only show active campaigns
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { objective: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minBudget !== undefined || maxBudget !== undefined) {
      where.budget = {};
      if (minBudget !== undefined) where.budget.gte = minBudget;
      if (maxBudget !== undefined) where.budget.lte = maxBudget;
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: {
            include: {
              profile: true,
              brandProfile: true,
            },
          },
          applications: userId ? {
            where: {
              influencerId: userId,
            },
            select: {
              id: true,
              status: true,
              appliedAt: true,
            },
          } : false,
          _count: {
            select: {
              participants: true,
              applications: true,
              contentSubmissions: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  // Get single campaign by ID
  async findOne(id: string, userId?: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: {
          include: {
            profile: true,
            brandProfile: true,
          },
        },
        applications: {
          include: {
            influencer: {
              include: {
                profile: true,
                influencerProfile: true,
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
        participants: {
          include: {
            influencer: {
              include: {
                profile: true,
                influencerProfile: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
        contentSubmissions: {
          include: {
            influencer: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
        _count: {
          select: {
            participants: true,
            applications: true,
            contentSubmissions: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // If userId is provided, check if user has applied or is participating
    if (userId) {
      const [hasApplied, isParticipant] = await Promise.all([
        this.prisma.campaignApplication.findFirst({
          where: { campaignId: id, influencerId: userId },
        }),
        this.prisma.campaignParticipant.findFirst({
          where: { campaignId: id, influencerId: userId },
        }),
      ]);

      return convertBigIntsToNumbers({
        ...campaign,
        userApplication: hasApplied,
        userParticipation: isParticipant,
      });
    }

    return convertBigIntsToNumbers(campaign);
  }

  // Update campaign
  async update(id: string, brandId: string, updateCampaignDto: UpdateCampaignDto) {
    // Check if campaign belongs to the brand
    const existingCampaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (existingCampaign.brandId !== brandId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        ...updateCampaignDto,
        startDate: updateCampaignDto.startDate ? new Date(updateCampaignDto.startDate) : undefined,
        endDate: updateCampaignDto.endDate ? new Date(updateCampaignDto.endDate) : undefined,
      },
      include: {
        brand: {
          include: {
            profile: true,
            brandProfile: true,
          },
        },
        _count: {
          select: {
            participants: true,
            applications: true,
            contentSubmissions: true,
          },
        },
      },
    });

    return updatedCampaign;
  }

  // Update campaign status
  async updateStatus(id: string, brandId: string, updateStatusDto: UpdateCampaignStatusDto) {
    const existingCampaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (existingCampaign.brandId !== brandId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    // Validate status transition
    this.validateStatusTransition(existingCampaign.status, updateStatusDto.status);

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        brand: {
          include: {
            profile: true,
            brandProfile: true,
          },
        },
        _count: {
          select: {
            participants: true,
            applications: true,
            contentSubmissions: true,
          },
        },
      },
    });

    return updatedCampaign;
  }

  // Delete campaign
  async remove(id: string, brandId: string) {
    const existingCampaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (existingCampaign.brandId !== brandId) {
      throw new ForbiddenException('You can only delete your own campaigns');
    }

    // Only allow deletion of draft campaigns
    if (existingCampaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Only draft campaigns can be deleted');
    }

    await this.prisma.campaign.delete({ where: { id } });

    return { message: 'Campaign deleted successfully' };
  }

  // Apply to campaign
  async applyToCampaign(
    campaignId: string,
    influencerId: string,
    applicationDto: CreateCampaignApplicationDto,
  ) {
    // Check if campaign exists and is active
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not accepting applications');
    }

    // Check if influencer has already applied
    const existingApplication = await this.prisma.campaignApplication.findUnique({
      where: {
        campaignId_influencerId: {
          campaignId,
          influencerId,
        },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this campaign');
    }

    // Check if influencer is already a participant
    const existingParticipant = await this.prisma.campaignParticipant.findUnique({
      where: {
        campaignId_influencerId: {
          campaignId,
          influencerId,
        },
      },
    });

    if (existingParticipant) {
      throw new BadRequestException('You are already a participant in this campaign');
    }

    const application = await this.prisma.campaignApplication.create({
      data: {
        campaignId,
        influencerId,
        applicationData: {
          message: applicationDto.message,
          proposedDeliverables: applicationDto.proposedDeliverables,
          ...applicationDto.applicationData,
        },
      },
      include: {
        campaign: {
          include: {
            brand: {
              include: {
                profile: true,
                brandProfile: true,
              },
            },
          },
        },
        influencer: {
          include: {
            profile: true,
            influencerProfile: true,
          },
        },
      },
    });

    return application;
  }

  // Get campaign applications
  async getCampaignApplications(campaignId: string, brandId: string) {
    // Verify campaign belongs to brand
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.brandId !== brandId) {
      throw new ForbiddenException('You can only view applications for your own campaigns');
    }

    const applications = await this.prisma.campaignApplication.findMany({
      where: { campaignId },
      include: {
        influencer: {
          include: {
            profile: true,
            influencerProfile: true,
            socialAccounts: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Convert BigInt values to numbers for JSON serialization
    return convertBigIntsToNumbers(applications);
  }

  // Update application status
  async updateApplicationStatus(
    applicationId: string,
    brandId: string,
    updateStatusDto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.campaignApplication.findUnique({
      where: { id: applicationId },
      include: {
        campaign: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.campaign.brandId !== brandId) {
      throw new ForbiddenException('You can only manage applications for your own campaigns');
    }

    const updatedApplication = await this.prisma.campaignApplication.update({
      where: { id: applicationId },
      data: {
        status: updateStatusDto.status,
        respondedAt: new Date(),
      },
      include: {
        influencer: {
          include: {
            profile: true,
            influencerProfile: true,
          },
        },
        campaign: true,
      },
    });

    // If application is accepted, create participant record
    if (updateStatusDto.status === 'ACCEPTED') {
      await this.prisma.campaignParticipant.create({
        data: {
          campaignId: application.campaignId,
          influencerId: application.influencerId,
          status: 'ACTIVE',
        },
      });
    }

    return updatedApplication;
  }

  // Get user's own applications
  async getUserApplications(userId: string) {
    const applications = await this.prisma.campaignApplication.findMany({
      where: { influencerId: userId },
      include: {
        campaign: {
          include: {
            brand: {
              include: {
                profile: true,
                brandProfile: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return convertBigIntsToNumbers(applications);
  }

  // Check if user has applied to specific campaign
  async checkUserApplicationStatus(campaignId: string, userId: string) {
    const application = await this.prisma.campaignApplication.findFirst({
      where: {
        campaignId,
        influencerId: userId,
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        applicationData: true,
      },
    });

    return {
      hasApplied: !!application,
      application: application || null,
    };
  }

  // Helper method to validate status transitions
  private validateStatusTransition(currentStatus: CampaignStatus, newStatus: CampaignStatus) {
    const validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
      DRAFT: [CampaignStatus.ACTIVE, CampaignStatus.CANCELLED],
      ACTIVE: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED, CampaignStatus.CANCELLED],
      PAUSED: [CampaignStatus.ACTIVE, CampaignStatus.CANCELLED],
      COMPLETED: [], // No transitions from completed
      CANCELLED: [], // No transitions from cancelled
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}