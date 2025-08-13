import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from '@prisma/client';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Create payment for content (Brand only)
  @Post('content/:contentId')
  @ApiOperation({ summary: 'Create payment for completed content' })
  @ApiParam({ name: 'contentId', description: 'Content submission ID' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async createContentPayment(
    @Param('contentId') contentId: string,
    @Req() req: any,
    @Body() paymentData: {
      amount: number;
      influencerId: string;
      paymentMethod?: string;
    },
  ) {
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can create payments');
    }

    return this.paymentsService.createPayment(req.user.id, {
      contentId,
      influencerId: paymentData.influencerId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
    });
  }

  // Create general payment (Brand only)
  @Post()
  @ApiOperation({ summary: 'Create a general payment to influencer' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createPayment(
    @Req() req: any,
    @Body() paymentData: {
      influencerId: string;
      amount: number;
      paymentMethod?: string;
    },
  ) {
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can create payments');
    }

    return this.paymentsService.createPayment(req.user.id, {
      influencerId: paymentData.influencerId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
    });
  }

  // Process payment (Brand only)
  @Post(':id/process')
  @ApiOperation({ summary: 'Process a pending payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async processPayment(
    @Param('id') id: string,
    @Req() req: any,
    @Body() processData: {
      paymentMethod?: string;
      transactionId?: string;
    },
  ) {
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can process payments');
    }

    return this.paymentsService.processPayment(req.user.id, {
      paymentId: id,
      paymentMethod: processData.paymentMethod,
      transactionId: processData.transactionId,
    });
  }

  // Get payments for current user
  @Get()
  @ApiOperation({ summary: 'Get payments for current user' })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'influencerId', required: false, description: 'Filter by influencer (brand only)' })
  @ApiQuery({ name: 'campaignId', required: false, description: 'Filter by campaign' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPayments(
    @Req() req: any,
    @Query('status') status?: PaymentStatus,
    @Query('influencerId') influencerId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = {
      status,
      influencerId,
      campaignId,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 10,
    };

    if (req.user.role === 'BRAND') {
      return this.paymentsService.getBrandPayments(req.user.id, filters);
    } else {
      return this.paymentsService.getInfluencerPayments(req.user.id, filters);
    }
  }

  // Get single payment
  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.getPayment(id, req.user.id, req.user.role);
  }

  // Get payment statistics
  @Get('stats/overview')
  @ApiOperation({ summary: 'Get payment statistics for current user' })
  @ApiResponse({ status: 200, description: 'Payment statistics retrieved successfully' })
  async getPaymentStats(@Req() req: any) {
    return this.paymentsService.getPaymentStats(req.user.id, req.user.role);
  }

  // Get payments for specific campaign and influencer (Brand only)
  @Get('campaign/:campaignId/influencer/:influencerId')
  @ApiOperation({ summary: 'Get payments for specific influencer in campaign' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiParam({ name: 'influencerId', description: 'Influencer ID' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getCampaignInfluencerPayments(
    @Param('campaignId') campaignId: string,
    @Param('influencerId') influencerId: string,
    @Req() req: any,
  ) {
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can access this endpoint');
    }

    return this.paymentsService.getBrandPayments(req.user.id, {
      campaignId,
      influencerId,
    });
  }
}