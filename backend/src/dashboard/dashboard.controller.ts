import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('brand/overview')
  @ApiOperation({ summary: 'Get brand dashboard data' })
  async getBrandDashboard(@Req() req: any) {
    return this.dashboardService.getBrandDashboard(req.user.id);
  }

  @Get('influencer/overview')
  @ApiOperation({ summary: 'Get influencer dashboard data' })
  async getInfluencerDashboard(@Req() req: any) {
    return this.dashboardService.getInfluencerDashboard(req.user.id);
  }

  

  @Get('brand/campaigns')
  @ApiOperation({ summary: 'Get brand campaigns list' })
  async getBrandCampaigns(@Req() req: any) {
    return this.dashboardService.getBrandCampaigns(req.user.id);
  }

  @Get('influencer/campaigns')
  @ApiOperation({ summary: 'Get influencer campaigns list' })
  async getInfluencerCampaigns(@Req() req: any) {
    return this.dashboardService.getInfluencerCampaigns(req.user.id);
  }

  @Get('influencer/earnings')
  @ApiOperation({ summary: 'Get influencer earnings and payment history' })
  async getInfluencerEarnings(@Req() req: any) {
    return this.dashboardService.getInfluencerEarnings(req.user.id);
  }

  @Get('brand/analytics')
  @ApiOperation({ summary: 'Get brand analytics data' })
  async getBrandAnalytics(@Req() req: any) {
    return this.dashboardService.getBrandAnalytics(req.user.id);
  }

  @Get('brand/pending-actions')
  @ApiOperation({ summary: 'Get brand pending actions' })
  async getBrandPendingActions(@Req() req: any) {
    return this.dashboardService.getBrandPendingActions(req.user.id);
  }

}
