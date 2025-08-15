import { Controller, Get, Post, Delete, Query, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DiscoverService } from './discover.service';
import { DiscoverInfluencersDto } from './dto/discover.dto';

@ApiTags('Discovery')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('discover')
export class DiscoverController {
  constructor(private discoverService: DiscoverService) {}

  @Get('influencers')
  @ApiOperation({ summary: 'Discover and search influencers' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'minFollowers', required: false, description: 'Minimum followers count' })
  @ApiQuery({ name: 'maxFollowers', required: false, description: 'Maximum followers count' })
  @ApiQuery({ name: 'locations', required: false, description: 'Comma-separated locations' })
  @ApiQuery({ name: 'niches', required: false, description: 'Comma-separated niches' })
  @ApiQuery({ name: 'platforms', required: false, description: 'Comma-separated platforms' })
  @ApiQuery({ name: 'engagementMin', required: false, description: 'Minimum engagement rate' })
  @ApiQuery({ name: 'verified', required: false, description: 'Verified accounts only' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async discoverInfluencers(@Query() query: DiscoverInfluencersDto, @Req() req: any) {
    const brandId = req.user?.id;
    return this.discoverService.discoverInfluencers(query, brandId);
  }

  @Post('shortlists/influencers/:influencerId')
  @ApiOperation({ summary: 'Add influencer to shortlist' })
  async addToShortlist(@Param('influencerId') influencerId: string, @Req() req: any) {
    const brandId = req.user.id;
    return this.discoverService.toggleShortlist(brandId, influencerId);
  }

  @Delete('shortlists/influencers/:influencerId')
  @ApiOperation({ summary: 'Remove influencer from shortlist' })
  async removeFromShortlist(@Param('influencerId') influencerId: string, @Req() req: any) {
    const brandId = req.user.id;
    return this.discoverService.toggleShortlist(brandId, influencerId);
  }

  @Get('shortlists')
  @ApiOperation({ summary: 'Get user shortlist' })
  async getShortlist(@Req() req: any) {
    const brandId = req.user.id;
    return this.discoverService.getShortlist(brandId);
  }
}