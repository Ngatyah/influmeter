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
import { ContentService } from './content.service';
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

@ApiTags('Content')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Create content submission (Influencer only)
  @Post()
  @ApiOperation({ summary: 'Create a new content submission' })
  @ApiResponse({ status: 201, description: 'Content submission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Req() req: any, @Body() createContentDto: CreateContentSubmissionDto) {
    // Ensure only influencers can create content
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can submit content');
    }

    return this.contentService.create(req.user.id, createContentDto);
  }

  // Get content submissions for influencer
  @Get('my-submissions')
  @ApiOperation({ summary: 'Get all content submissions for the authenticated influencer' })
  @ApiResponse({ status: 200, description: 'Content submissions retrieved successfully' })
  async findMySubmissions(
    @Req() req: any,
    @Query() filters: ContentFilterDto,
  ) {
    // Ensure only influencers can access this endpoint
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can access this endpoint');
    }

    return this.contentService.findAllByInfluencer(req.user.id, filters);
  }

  // Get content submissions for brand's campaigns
  @Get('brand-content')
  @ApiOperation({ summary: 'Get all content submissions for brand campaigns' })
  @ApiResponse({ status: 200, description: 'Content submissions retrieved successfully' })
  async findBrandContent(
    @Req() req: any,
    @Query() filters: ContentFilterDto,
  ) {
    // Ensure only brands can access this endpoint
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can access this endpoint');
    }

    return this.contentService.findAllByBrand(req.user.id, filters);
  }

  // Get content submissions by influencer for a specific campaign (Brand only)
  @Get('influencer/:influencerId/campaign/:campaignId')
  @ApiOperation({ summary: 'Get content submissions by specific influencer for a campaign' })
  @ApiParam({ name: 'influencerId', description: 'Influencer ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Content submissions retrieved successfully' })
  async findInfluencerContentForCampaign(
    @Param('influencerId') influencerId: string,
    @Param('campaignId') campaignId: string,
    @Req() req: any,
    @Query() filters?: ContentFilterDto,
  ) {
    // Ensure only brands can access this endpoint
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can access this endpoint');
    }

    // Use the existing method with specific filters
    return this.contentService.findAllByInfluencer(influencerId, {
      ...filters,
      campaignId,
    });
  }

  // Get single content submission
  @Get(':id')
  @ApiOperation({ summary: 'Get a single content submission' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Content submission retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content submission not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.contentService.findOne(id, req.user.id, req.user.role);
  }

  // Update content submission (Influencer only)
  @Put(':id')
  @ApiOperation({ summary: 'Update content submission' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Content submission updated successfully' })
  @ApiResponse({ status: 404, description: 'Content submission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateContentDto: UpdateContentSubmissionDto,
  ) {
    // Ensure only influencers can update content
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can update content submissions');
    }

    return this.contentService.update(id, req.user.id, updateContentDto);
  }

  // Update content status (Brand only)
  @Put(':id/status')
  @ApiOperation({ summary: 'Update content submission status' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Content status updated successfully' })
  @ApiResponse({ status: 404, description: 'Content submission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateStatusDto: UpdateContentStatusDto,
  ) {
    // Ensure only brands can update content status
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can update content status');
    }

    return this.contentService.updateStatus(id, req.user.id, updateStatusDto);
  }

  // Add files to content submission
  @Post(':id/files')
  @ApiOperation({ summary: 'Add files to content submission' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 201, description: 'Files added successfully' })
  @ApiResponse({ status: 404, description: 'Content submission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addFiles(
    @Param('id') id: string,
    @Req() req: any,
    @Body() files: ContentFileDto[],
  ) {
    return this.contentService.addFiles(id, req.user.id, files);
  }

  // Get files for content submission
  @Get(':id/files')
  @ApiOperation({ summary: 'Get files for content submission' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content submission not found' })
  async getFiles(@Param('id') id: string, @Req() req: any) {
    return this.contentService.getFiles(id, req.user.id, req.user.role);
  }

  // Update performance data
  @Put(':id/performance')
  @ApiOperation({ summary: 'Update content performance data' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Performance data updated successfully' })
  @ApiResponse({ status: 404, description: 'Content submission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updatePerformance(
    @Param('id') id: string,
    @Req() req: any,
    @Body() performanceData: ContentPerformanceDto,
  ) {
    // Only influencers can update their content performance
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can update performance data');
    }

    return this.contentService.updatePerformance(id, req.user.id, performanceData);
  }

  // Delete content submission
  @Delete(':id')
  @ApiOperation({ summary: 'Delete content submission' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Content submission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content submission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @Req() req: any) {
    // Only influencers can delete their own content
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can delete content submissions');
    }

    return this.contentService.remove(id, req.user.id);
  }

  // Approve content (Brand only) - Convenience endpoint
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve content submission' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Content approved successfully' })
  async approve(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can approve content');
    }

    return this.contentService.updateStatus(id, req.user.id, {
      status: 'APPROVED',
      feedback: 'Content approved',
    });
  }

  // Reject content (Brand only) - Convenience endpoint
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject content submission' })
  @ApiParam({ name: 'id', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Content rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Req() req: any,
    @Body('feedback') feedback?: string,
  ) {
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can reject content');
    }

    return this.contentService.updateStatus(id, req.user.id, {
      status: 'REJECTED',
      feedback: feedback || 'Content needs revision',
    });
  }

  // Published Posts endpoints

  // Create published post (Influencer only)
  @Post('published-posts')
  @ApiOperation({ summary: 'Submit published post URL' })
  @ApiResponse({ status: 201, description: 'Published post submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createPublishedPost(@Req() req: any, @Body() createPublishedPostDto: CreatePublishedPostDto) {
    // Ensure only influencers can submit published posts
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can submit published posts');
    }

    return this.contentService.createPublishedPost(req.user.id, createPublishedPostDto);
  }

  // Get published posts for content submission
  @Get(':contentId/published-posts')
  @ApiOperation({ summary: 'Get published posts for content submission' })
  @ApiParam({ name: 'contentId', description: 'Content submission ID' })
  @ApiResponse({ status: 200, description: 'Published posts retrieved successfully' })
  async getPublishedPosts(@Param('contentId') contentId: string, @Req() req: any) {
    return this.contentService.getPublishedPosts(contentId, req.user.id, req.user.role);
  }

  // Update published post
  @Put('published-posts/:postId')
  @ApiOperation({ summary: 'Update published post' })
  @ApiParam({ name: 'postId', description: 'Published post ID' })
  @ApiResponse({ status: 200, description: 'Published post updated successfully' })
  @ApiResponse({ status: 404, description: 'Published post not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updatePublishedPost(
    @Param('postId') postId: string,
    @Req() req: any,
    @Body() updatePublishedPostDto: UpdatePublishedPostDto,
  ) {
    // Only influencers can update their published posts
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can update published posts');
    }

    return this.contentService.updatePublishedPost(postId, req.user.id, updatePublishedPostDto);
  }

  // Delete published post
  @Delete('published-posts/:postId')
  @ApiOperation({ summary: 'Delete published post' })
  @ApiParam({ name: 'postId', description: 'Published post ID' })
  @ApiResponse({ status: 200, description: 'Published post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Published post not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deletePublishedPost(@Param('postId') postId: string, @Req() req: any) {
    // Only influencers can delete their published posts
    if (req.user.role !== 'INFLUENCER') {
      throw new Error('Only influencers can delete published posts');
    }

    return this.contentService.deletePublishedPost(postId, req.user.id);
  }
}