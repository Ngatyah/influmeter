import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContentSubmissionDto,
  UpdateContentSubmissionDto,
  UpdateContentStatusDto,
  ContentFileDto,
  ContentFilterDto,
  ContentPerformanceDto,
  CreatePublishedPostDto,
  UpdatePublishedPostDto,
} from './dto/content.dto';
import { ContentStatus, ContentType } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new content submission
  async create(influencerId: string, createContentDto: CreateContentSubmissionDto) {
    // Verify the campaign exists and influencer is a participant
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createContentDto.campaignId },
      include: {
        participants: {
          where: { influencerId },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.participants.length === 0) {
      throw new ForbiddenException('You are not a participant in this campaign');
    }

    if (campaign.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot submit content for inactive campaigns');
    }

    // Check if content already exists for this campaign by this influencer
    const existingContent = await this.prisma.contentSubmission.findFirst({
      where: {
        campaignId: createContentDto.campaignId,
        influencerId,
      },
    });

    if (existingContent) {
      throw new BadRequestException('Content already submitted for this campaign');
    }

    const contentSubmission = await this.prisma.contentSubmission.create({
      data: {
        ...createContentDto,
        influencerId,
        hashtags: createContentDto.hashtags || [],
        platforms: createContentDto.platforms || [],
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
        files: true,
        performance: true,
      },
    });

    return contentSubmission;
  }

  // Get all content submissions for an influencer
  async findAllByInfluencer(influencerId: string, filters?: ContentFilterDto) {
    const {
      search,
      status,
      contentType,
      campaignId,
      page = 1,
      limit = 10,
    } = filters || {};

    const skip = (page - 1) * limit;

    const where: any = {
      influencerId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (contentType) {
      where.contentType = contentType;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    const [contentSubmissions, total] = await Promise.all([
      this.prisma.contentSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
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
          files: true,
          performance: true,
          publishedPosts: {
            include: {
              performance: true,
            },
          },
        },
      }),
      this.prisma.contentSubmission.count({ where }),
    ]);

    return {
      contentSubmissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    };
  }

  // Get all content submissions for a brand's campaigns
  async findAllByBrand(brandId: string, filters?: ContentFilterDto) {
    const {
      search,
      status,
      contentType,
      campaignId,
      page = 1,
      limit = 10,
    } = filters || {};

    const skip = (page - 1) * limit;

    const where: any = {
      campaign: {
        brandId,
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (contentType) {
      where.contentType = contentType;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    const [contentSubmissions, total] = await Promise.all([
      this.prisma.contentSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          campaign: true,
          influencer: {
            include: {
              profile: true,
              influencerProfile: true,
            },
          },
          files: true,
          performance: true,
          publishedPosts: {
            include: {
              performance: true,
            },
          },
        },
      }),
      this.prisma.contentSubmission.count({ where }),
    ]);

    return {
      contentSubmissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    };
  }

  // Get single content submission
  async findOne(id: string, userId: string, userRole: 'BRAND' | 'INFLUENCER') {
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id },
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
        files: true,
        performance: true,
        publishedPosts: {
          include: {
            performance: true,
          },
        },
      },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    // Check permissions
    if (userRole === 'INFLUENCER' && contentSubmission.influencerId !== userId) {
      throw new ForbiddenException('You can only access your own content submissions');
    }

    if (userRole === 'BRAND' && contentSubmission.campaign.brandId !== userId) {
      throw new ForbiddenException('You can only access content for your campaigns');
    }

    return contentSubmission;
  }

  // Update content submission (influencer only)
  async update(id: string, influencerId: string, updateContentDto: UpdateContentSubmissionDto) {
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    if (contentSubmission.influencerId !== influencerId) {
      throw new ForbiddenException('You can only update your own content submissions');
    }

    if (contentSubmission.status !== 'PENDING' && contentSubmission.status !== 'REJECTED') {
      throw new BadRequestException('Cannot update approved or completed content');
    }

    const updatedContent = await this.prisma.contentSubmission.update({
      where: { id },
      data: {
        ...updateContentDto,
        hashtags: updateContentDto.hashtags || contentSubmission.hashtags,
        platforms: updateContentDto.platforms || contentSubmission.platforms,
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
        files: true,
        performance: true,
        publishedPosts: {
          include: {
            performance: true,
          },
        },
      },
    });

    return updatedContent;
  }

  // Update content status (brand only)
  async updateStatus(id: string, brandId: string, updateStatusDto: UpdateContentStatusDto) {
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    if (contentSubmission.campaign.brandId !== brandId) {
      throw new ForbiddenException('You can only update content status for your campaigns');
    }

    const updateData: any = {
      status: updateStatusDto.status,
      feedback: updateStatusDto.feedback,
    };

    // Set timestamps based on status
    if (updateStatusDto.status === 'APPROVED') {
      updateData.approvedAt = new Date();
    } else if (updateStatusDto.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedContent = await this.prisma.contentSubmission.update({
      where: { id },
      data: updateData,
      include: {
        campaign: true,
        influencer: {
          include: {
            profile: true,
            influencerProfile: true,
          },
        },
        files: true,
        performance: true,
        publishedPosts: {
          include: {
            performance: true,
          },
        },
      },
    });

    return updatedContent;
  }

  // Add files to content submission
  async addFiles(contentId: string, userId: string, files: ContentFileDto[]) {
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id: contentId },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    if (contentSubmission.influencerId !== userId) {
      throw new ForbiddenException('You can only add files to your own content submissions');
    }

    if (contentSubmission.status === 'COMPLETED' || contentSubmission.status === 'PAID') {
      throw new BadRequestException('Cannot add files to completed content');
    }

    const createdFiles = await this.prisma.contentFile.createMany({
      data: files.map(file => ({
        ...file,
        contentId,
        fileSize: file.fileSize ? BigInt(file.fileSize) : null,
      })),
    });

    return createdFiles;
  }

  // Get files for content submission
  async getFiles(contentId: string, userId: string, userRole: 'BRAND' | 'INFLUENCER') {
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id: contentId },
      include: {
        campaign: true,
      },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    // Check permissions
    if (userRole === 'INFLUENCER' && contentSubmission.influencerId !== userId) {
      throw new ForbiddenException('You can only access files for your own content');
    }

    if (userRole === 'BRAND' && contentSubmission.campaign.brandId !== userId) {
      throw new ForbiddenException('You can only access files for your campaigns');
    }

    const files = await this.prisma.contentFile.findMany({
      where: { contentId },
      orderBy: { createdAt: 'desc' },
    });

    return files;
  }

  // Add or update performance data
  async updatePerformance(contentId: string, userId: string, performanceData: ContentPerformanceDto) {
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id: contentId },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    if (contentSubmission.influencerId !== userId) {
      throw new ForbiddenException('You can only update performance for your own content');
    }

    const performance = await this.prisma.contentPerformance.upsert({
      where: { contentId },
      create: {
        contentId,
        ...performanceData,
        lastUpdated: new Date(),
      },
      update: {
        ...performanceData,
        lastUpdated: new Date(),
      },
    });

    return performance;
  }

  // Delete content submission (influencer only, if pending)
  async remove(id: string, influencerId: string) {
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    if (contentSubmission.influencerId !== influencerId) {
      throw new ForbiddenException('You can only delete your own content submissions');
    }

    if (contentSubmission.status !== 'PENDING' && contentSubmission.status !== 'REJECTED') {
      throw new BadRequestException('Cannot delete approved or completed content');
    }

    await this.prisma.contentSubmission.delete({
      where: { id },
    });

    return { message: 'Content submission deleted successfully' };
  }

  // Published Post Methods

  // Create published post
  async createPublishedPost(userId: string, createPublishedPostDto: CreatePublishedPostDto) {
    // Verify the content submission exists and belongs to the influencer
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id: createPublishedPostDto.contentId },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    if (contentSubmission.influencerId !== userId) {
      throw new ForbiddenException('You can only add published posts to your own content submissions');
    }

    if (contentSubmission.status !== 'APPROVED') {
      throw new BadRequestException('Can only publish approved content');
    }

    const publishedPost = await this.prisma.publishedPost.create({
      data: {
        ...createPublishedPostDto,
        publishedAt: new Date(createPublishedPostDto.publishedAt),
      },
    });

    return publishedPost;
  }

  // Get published posts for content submission
  async getPublishedPosts(contentId: string, userId: string, userRole: string) {
    const contentSubmission = await this.prisma.contentSubmission.findUnique({
      where: { id: contentId },
      include: {
        campaign: {
          include: {
            brand: true,
          },
        },
      },
    });

    if (!contentSubmission) {
      throw new NotFoundException('Content submission not found');
    }

    // Check access permissions
    if (userRole === 'INFLUENCER' && contentSubmission.influencerId !== userId) {
      throw new ForbiddenException('You can only view published posts for your own content');
    }

    if (userRole === 'BRAND' && contentSubmission.campaign.brandId !== userId) {
      throw new ForbiddenException('You can only view published posts for your own campaigns');
    }

    const publishedPosts = await this.prisma.publishedPost.findMany({
      where: { contentId },
      include: {
        performance: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    return publishedPosts;
  }

  // Update published post
  async updatePublishedPost(postId: string, userId: string, updateData: UpdatePublishedPostDto) {
    const publishedPost = await this.prisma.publishedPost.findUnique({
      where: { id: postId },
      include: {
        contentSubmission: true,
      },
    });

    if (!publishedPost) {
      throw new NotFoundException('Published post not found');
    }

    if (publishedPost.contentSubmission.influencerId !== userId) {
      throw new ForbiddenException('You can only update your own published posts');
    }

    const updatedPost = await this.prisma.publishedPost.update({
      where: { id: postId },
      data: {
        ...updateData,
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : undefined,
      },
      include: {
        performance: true,
      },
    });

    return updatedPost;
  }

  // Delete published post
  async deletePublishedPost(postId: string, userId: string) {
    const publishedPost = await this.prisma.publishedPost.findUnique({
      where: { id: postId },
      include: {
        contentSubmission: true,
      },
    });

    if (!publishedPost) {
      throw new NotFoundException('Published post not found');
    }

    if (publishedPost.contentSubmission.influencerId !== userId) {
      throw new ForbiddenException('You can only delete your own published posts');
    }

    await this.prisma.publishedPost.delete({
      where: { id: postId },
    });

    return { message: 'Published post deleted successfully' };
  }
}