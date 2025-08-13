import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
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
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  UpdateCampaignStatusDto,
  CampaignFilterDto,
  CreateCampaignApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/campaign.dto';

@ApiTags('Campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // Create a new campaign (Brand only)
  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Req() req: any, @Body() createCampaignDto: CreateCampaignDto) {
    // Ensure only brands can create campaigns
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can create campaigns');
    }
    
    return this.campaignsService.create(req.user.id, createCampaignDto);
  }

  // Get all campaigns for the authenticated brand
  @Get('my-campaigns')
  @ApiOperation({ summary: 'Get all campaigns for the authenticated brand' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async findMyBrandCampaigns(
    @Req() req: any,
    @Query() filters: CampaignFilterDto,
  ) {
    // Ensure only brands can access this endpoint
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can access this endpoint');
    }
    
    return this.campaignsService.findAllByBrand(req.user.id, filters);
  }

  // Browse campaigns (Influencer view)
  @Get('browse')
  @ApiOperation({ summary: 'Browse active campaigns (for influencers)' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async browseCampaigns(@Query() filters: CampaignFilterDto, @Req() req: any) {
    return this.campaignsService.browse(filters, req.user?.id);
  }

  // Get user's own applications (Influencer only)
  @Get('applications/my')
  @ApiOperation({ summary: 'Get user\'s own campaign applications' })
  @ApiResponse({ status: 200, description: 'User applications retrieved successfully' })
  async getMyApplications(@Req() req: any) {
    // Ensure only influencers can access this endpoint
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can access this endpoint');
    }

    return this.campaignsService.getUserApplications(req.user.id);
  }

  // Check if user has applied to specific campaign (Influencer only)
  @Get(':id/application-status')
  @ApiOperation({ summary: 'Check if user has applied to campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Application status retrieved' })
  async getApplicationStatus(@Param('id') campaignId: string, @Req() req: any) {
    // Ensure only influencers can access this endpoint
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can access this endpoint');
    }

    return this.campaignsService.checkUserApplicationStatus(campaignId, req.user.id);
  }

  // Get single campaign by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.campaignsService.findOne(id, req.user.id);
  }

  // Update campaign (Brand only)
  @Put(':id')
  @ApiOperation({ summary: 'Update campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your campaign' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    // Ensure only brands can update campaigns
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can update campaigns');
    }
    
    return this.campaignsService.update(id, req.user.id, updateCampaignDto);
  }

  // Update campaign status (Brand only)
  @Put(':id/status')
  @ApiOperation({ summary: 'Update campaign status' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your campaign' })
  async updateStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateStatusDto: UpdateCampaignStatusDto,
  ) {
    // Ensure only brands can update campaign status
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can update campaign status');
    }
    
    return this.campaignsService.updateStatus(id, req.user.id, updateStatusDto);
  }

  // Delete campaign (Brand only)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign (Draft only)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete non-draft campaign' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your campaign' })
  async remove(@Param('id') id: string, @Req() req: any) {
    // Ensure only brands can delete campaigns
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can delete campaigns');
    }
    
    return this.campaignsService.remove(id, req.user.id);
  }

  // Apply to campaign (Influencer only)
  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply to campaign (Influencers only)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 400, description: 'Already applied or campaign not active' })
  async applyToCampaign(
    @Param('id') campaignId: string,
    @Req() req: any,
    @Body() applicationDto: CreateCampaignApplicationDto,
  ) {
    // Ensure only influencers can apply
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can apply to campaigns');
    }
    
    return this.campaignsService.applyToCampaign(
      campaignId,
      req.user.id,
      applicationDto,
    );
  }

  // Get campaign applications (Brand only)
  @Get(':id/applications')
  @ApiOperation({ summary: 'Get campaign applications (Brand only)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your campaign' })
  async getCampaignApplications(@Param('id') campaignId: string, @Req() req: any) {
    // Ensure only brands can view applications
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can view campaign applications');
    }
    
    return this.campaignsService.getCampaignApplications(campaignId, req.user.id);
  }

  // Update application status (Brand only)
  @Put('applications/:applicationId/status')
  @ApiOperation({ summary: 'Update application status (Brand only)' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application status updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your campaign' })
  async updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Req() req: any,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    // Ensure only brands can update application status
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can update application status');
    }
    
    return this.campaignsService.updateApplicationStatus(
      applicationId,
      req.user.id,
      updateStatusDto,
    );
  }

}