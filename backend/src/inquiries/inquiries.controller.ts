import { Controller, Get, Post, Put, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto';

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private inquiriesService: InquiriesService) {}

  // Public endpoint for creating inquiries (no auth required for brands to contact influencers)
  @Post()
  @ApiOperation({ summary: 'Create new inquiry for influencer package' })
  async createInquiry(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.createInquiry(dto);
  }

  // Protected endpoints (authentication required)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('received')
  @ApiOperation({ summary: 'Get inquiries received by current user (influencer)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONTACTED', 'NEGOTIATING', 'ACCEPTED', 'DECLINED', 'COMPLETED'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReceivedInquiries(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.inquiriesService.getReceivedInquiries(req.user.id, {
      status,
      page: page || 1,
      limit: limit || 10
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('sent')
  @ApiOperation({ summary: 'Get inquiries sent by current user (brand)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONTACTED', 'NEGOTIATING', 'ACCEPTED', 'DECLINED', 'COMPLETED'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSentInquiries(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.inquiriesService.getSentInquiries(req.user.email, {
      status,
      page: page || 1,
      limit: limit || 10
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get inquiry details' })
  @ApiParam({ name: 'id', description: 'Inquiry ID' })
  async getInquiry(@Req() req: any, @Param('id') id: string) {
    return this.inquiriesService.getInquiry(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/status')
  @ApiOperation({ summary: 'Update inquiry status (influencer only)' })
  @ApiParam({ name: 'id', description: 'Inquiry ID' })
  async updateInquiryStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusDto
  ) {
    return this.inquiriesService.updateInquiryStatus(id, req.user.id, dto);
  }
}