import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { convertBigIntsToNumbers } from '../common/utils/bigint.util';

interface CreatePaymentData {
  contentId?: string;
  influencerId: string;
  amount: number;
  paymentMethod?: string;
}

interface ProcessPaymentData {
  paymentId: string;
  transactionId?: string;
  paymentMethod?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a payment for content
  async createPayment(brandId: string, data: CreatePaymentData) {
    const { contentId, influencerId, amount, paymentMethod } = data;

    // Calculate platform fee (5%)
    const platformFee = amount * 0.05;
    const netAmount = amount - platformFee;

    // If contentId is provided, verify the content exists and belongs to the influencer
    if (contentId) {
      const content = await this.prisma.contentSubmission.findUnique({
        where: { id: contentId },
        include: { campaign: true },
      });

      if (!content) {
        throw new NotFoundException('Content submission not found');
      }

      if (content.influencerId !== influencerId) {
        throw new BadRequestException('Content does not belong to the specified influencer');
      }

      if (content.campaign.brandId !== brandId) {
        throw new ForbiddenException('You can only create payments for your own campaigns');
      }

      if (content.status !== 'COMPLETED') {
        throw new BadRequestException('Can only pay for completed content');
      }

      // Check if payment already exists for this content
      const existingPayment = await this.prisma.payment.findFirst({
        where: { contentId, status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] } },
      });

      if (existingPayment) {
        throw new BadRequestException('Payment already exists for this content');
      }
    }

    // Create the payment
    const payment = await this.prisma.payment.create({
      data: {
        contentId,
        influencerId,
        brandId,
        amount,
        platformFee,
        netAmount,
        paymentMethod,
        status: 'PENDING',
      },
      include: {
        content: {
          include: {
            campaign: true,
          },
        },
        influencer: {
          include: {
            profile: true,
          },
        },
      },
    });

    return convertBigIntsToNumbers(payment);
  }

  // Process payment (simulate payment processing)
  async processPayment(brandId: string, data: ProcessPaymentData) {
    const { paymentId, transactionId, paymentMethod } = data;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        content: true,
        influencer: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.brandId !== brandId) {
      throw new ForbiddenException('You can only process your own payments');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Payment is not in pending status');
    }

    // Update payment status to processing first
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PROCESSING',
        paymentMethod: paymentMethod || payment.paymentMethod,
      },
    });

    // Simulate payment processing delay
    // In real implementation, this would integrate with payment providers
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update payment to completed
    const completedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        transactionId: transactionId || `TXN_${Date.now()}`,
        processedAt: new Date(),
      },
      include: {
        content: {
          include: {
            campaign: true,
          },
        },
        influencer: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Update content status to PAID if payment is for content
    if (payment.contentId) {
      await this.prisma.contentSubmission.update({
        where: { id: payment.contentId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    // Update user earnings
    await this.updateUserEarnings(payment.influencerId, Number(payment.netAmount));

    return convertBigIntsToNumbers(completedPayment);
  }

  // Get payments for a brand
  async getBrandPayments(brandId: string, filters?: {
    status?: PaymentStatus;
    influencerId?: string;
    campaignId?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      influencerId,
      campaignId,
      page = 1,
      limit = 10,
    } = filters || {};

    const skip = (page - 1) * limit;

    const where: any = {
      brandId,
    };

    if (status) {
      where.status = status;
    }

    if (influencerId) {
      where.influencerId = influencerId;
    }

    if (campaignId) {
      where.content = {
        campaignId,
      };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          content: {
            include: {
              campaign: true,
            },
          },
          influencer: {
            include: {
              profile: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return convertBigIntsToNumbers({
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    });
  }

  // Get payments for an influencer
  async getInfluencerPayments(influencerId: string, filters?: {
    status?: PaymentStatus;
    campaignId?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      campaignId,
      page = 1,
      limit = 10,
    } = filters || {};

    const skip = (page - 1) * limit;

    const where: any = {
      influencerId,
    };

    if (status) {
      where.status = status;
    }

    if (campaignId) {
      where.content = {
        campaignId,
      };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          content: {
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
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return convertBigIntsToNumbers({
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    });
  }

  // Get single payment
  async getPayment(id: string, userId: string, userRole: 'BRAND' | 'INFLUENCER') {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        content: {
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
        },
        influencer: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check permissions
    if (userRole === 'BRAND' && payment.brandId !== userId) {
      throw new ForbiddenException('You can only view your own payments');
    }

    if (userRole === 'INFLUENCER' && payment.influencerId !== userId) {
      throw new ForbiddenException('You can only view payments made to you');
    }

    return convertBigIntsToNumbers(payment);
  }

  // Update user earnings
  private async updateUserEarnings(userId: string, amount: number) {
    await this.prisma.userEarnings.upsert({
      where: { userId },
      create: {
        userId,
        totalEarned: amount,
        totalPaid: amount,
        pendingAmount: 0,
        lastPayoutAt: new Date(),
      },
      update: {
        totalEarned: {
          increment: amount,
        },
        totalPaid: {
          increment: amount,
        },
        lastPayoutAt: new Date(),
      },
    });
  }

  // Get payment statistics
  async getPaymentStats(userId: string, userRole: 'BRAND' | 'INFLUENCER') {
    if (userRole === 'BRAND') {
      const stats = await this.prisma.payment.groupBy({
        by: ['status'],
        where: { brandId: userId },
        _sum: {
          amount: true,
        },
        _count: true,
      });

      return convertBigIntsToNumbers({
        totalPayments: stats.reduce((sum, stat) => sum + stat._count, 0),
        totalAmount: stats.reduce((sum, stat) => sum + Number(stat._sum.amount || 0), 0),
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count,
            amount: Number(stat._sum.amount || 0),
          };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
      });
    } else {
      const stats = await this.prisma.payment.groupBy({
        by: ['status'],
        where: { influencerId: userId },
        _sum: {
          netAmount: true,
        },
        _count: true,
      });

      return convertBigIntsToNumbers({
        totalPayments: stats.reduce((sum, stat) => sum + stat._count, 0),
        totalEarnings: stats.reduce((sum, stat) => sum + Number(stat._sum.netAmount || 0), 0),
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count,
            earnings: Number(stat._sum.netAmount || 0),
          };
          return acc;
        }, {} as Record<string, { count: number; earnings: number }>),
      });
    }
  }
}