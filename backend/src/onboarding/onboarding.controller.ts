import { Controller, Post, Get, Put, Body, UseGuards, Req, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OnboardingService } from './onboarding.service';
import {
  InfluencerPersonalDto,
  InfluencerCategoriesDto,
  InfluencerSocialDto,
  InfluencerRatesDto,
  BrandCompanyDto,
  BrandGoalsDto,
  BrandPreferencesDto,
} from './dto/onboarding.dto';

@ApiTags('Onboarding')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Get onboarding progress' })
  async getProgress(@Req() req: any) {
    return this.onboardingService.getProgress(req.user.id);
  }

  // Influencer Onboarding Endpoints
  @Post('influencer/personal')
  @ApiOperation({ summary: 'Save influencer personal information' })
  @ApiResponse({ status: 201, description: 'Personal information saved successfully' })
  async saveInfluencerPersonal(@Req() req: any, @Body() data: InfluencerPersonalDto) {
    return this.onboardingService.saveInfluencerPersonal(req.user.id, data);
  }

  @Post('influencer/categories')
  @ApiOperation({ summary: 'Save influencer categories and niches' })
  async saveInfluencerCategories(@Req() req: any, @Body() data: InfluencerCategoriesDto) {
    return this.onboardingService.saveInfluencerCategories(req.user.id, data);
  }

  @Post('influencer/social')
  @ApiOperation({ summary: 'Save influencer social media accounts' })
  async saveInfluencerSocial(@Req() req: any, @Body() data: InfluencerSocialDto) {
    return this.onboardingService.saveInfluencerSocial(req.user.id, data);
  }

  @Post('influencer/rates')
  @ApiOperation({ summary: 'Save influencer content types and rates' })
  async saveInfluencerRates(@Req() req: any, @Body() data: InfluencerRatesDto) {
    return this.onboardingService.saveInfluencerRates(req.user.id, data);
  }

  // Brand Onboarding Endpoints
  @Post('brand/company')
  @ApiOperation({ summary: 'Save brand company information' })
  async saveBrandCompany(@Req() req: any, @Body() data: BrandCompanyDto) {
    return this.onboardingService.saveBrandCompany(req.user.id, data);
  }

  @Post('brand/goals')
  @ApiOperation({ summary: 'Save brand marketing goals' })
  async saveBrandGoals(@Req() req: any, @Body() data: BrandGoalsDto) {
    return this.onboardingService.saveBrandGoals(req.user.id, data);
  }

  @Post('brand/preferences')
  @ApiOperation({ summary: 'Save brand preferences' })
  async saveBrandPreferences(@Req() req: any, @Body() data: BrandPreferencesDto) {
    return this.onboardingService.saveBrandPreferences(req.user.id, data);
  }

  // Skip step endpoint
  @Put('skip/:step')
  @ApiOperation({ summary: 'Skip onboarding step' })
  async skipStep(@Req() req: any, @Param('step') step: string) {
    return this.onboardingService.skipStep(req.user.id, parseInt(step));
  }
}
