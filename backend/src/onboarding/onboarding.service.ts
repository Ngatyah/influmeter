import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  InfluencerPersonalDto, 
  InfluencerCategoriesDto, 
  InfluencerSocialDto, 
  InfluencerRatesDto,
  BrandCompanyDto,
  BrandGoalsDto,
  BrandPreferencesDto
} from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  // Get onboarding progress
  async getProgress(userId: string) {
    const progress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    return progress || {
      currentStep: 1,
      completedSteps: [],
      isCompleted: false,
      data: {},
    };
  }

  // Influencer Onboarding Steps
  async saveInfluencerPersonal(userId: string, data: InfluencerPersonalDto) {
    // Update user profile
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              bio: data.bio,
              location: data.location,
              phone: data.phone,
            },
            update: {
              firstName: data.firstName,
              lastName: data.lastName,
              bio: data.bio,
              location: data.location,
              phone: data.phone,
            },
          },
        },
      },
    });

    // Update onboarding progress
    await this.updateProgress(userId, 1, data);

    return { success: true, nextStep: 2 };
  }

  async saveInfluencerCategories(userId: string, data: InfluencerCategoriesDto) {
    // Update influencer profile
    await this.prisma.influencerProfile.upsert({
      where: { userId },
      create: {
        userId,
        categories: data.categories,
        niches: data.niches,
        languages: data.languages,
      },
      update: {
        categories: data.categories,
        niches: data.niches,
        languages: data.languages,
      },
    });

    await this.updateProgress(userId, 2, data);
    return { success: true, nextStep: 3 };
  }

  async saveInfluencerSocial(userId: string, data: InfluencerSocialDto) {
    // Validate that accounts array exists
    if (!data.accounts || !Array.isArray(data.accounts)) {
      throw new BadRequestException('Invalid social accounts data format');
    }

    // Save social accounts
    for (const account of data.accounts) {
      if (!account.platform || !account.username) {
        continue; // Skip invalid accounts
      }
      
      await this.prisma.socialAccount.upsert({
        where: {
          userId_platform: {
            userId,
            platform: account.platform,
          },
        },
        create: {
          userId,
          platform: account.platform,
          username: account.username,
          followersCount: this.parseFollowerCount(account.followers || '0'),
          isConnected: true,
        },
        update: {
          username: account.username,
          followersCount: this.parseFollowerCount(account.followers || '0'),
          isConnected: true,
        },
      });
    }

    await this.updateProgress(userId, 3, data);
    return { success: true, nextStep: 4 };
  }

  async saveInfluencerRates(userId: string, data: InfluencerRatesDto) {
    // Update influencer profile with rates
    await this.prisma.influencerProfile.upsert({
      where: { userId },
      create: {
        userId,
        contentTypes: data.contentTypes,
        rates: data.rates,
      },
      update: {
        contentTypes: data.contentTypes,
        rates: data.rates,
      },
    });

    // Mark onboarding as completed
    await this.updateProgress(userId, 4, data, true);
    return { success: true, completed: true };
  }

  // Brand Onboarding Steps
  async saveBrandCompany(userId: string, data: BrandCompanyDto) {
    // Update user profile
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: {
              firstName: data.contactName?.split(' ')[0] || '',
              lastName: data.contactName?.split(' ').slice(1).join(' ') || '',
            },
            update: {
              firstName: data.contactName?.split(' ')[0] || '',
              lastName: data.contactName?.split(' ').slice(1).join(' ') || '',
            },
          },
        },
      },
    });

    // Create brand profile
    await this.prisma.brandProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize as any,
        description: data.description,
        logoUrl: data.logoUrl,
      },
      update: {
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize as any,
        description: data.description,
        logoUrl: data.logoUrl,
      },
    });

    await this.updateProgress(userId, 1, data);
    return { success: true, nextStep: 2 };
  }

  async saveBrandGoals(userId: string, data: BrandGoalsDto) {
    await this.prisma.brandProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: 'Temp', // Will be updated from step 1
        marketingGoals: data.objectives,
        targetAudience: {
          demographics: data.targetAudience,
          campaignTypes: data.campaignTypes,
        },
      },
      update: {
        marketingGoals: data.objectives,
        targetAudience: {
          demographics: data.targetAudience,
          campaignTypes: data.campaignTypes,
        },
      },
    });

    await this.updateProgress(userId, 2, data);
    return { success: true, nextStep: 3 };
  }

  async saveBrandPreferences(userId: string, data: BrandPreferencesDto) {
    await this.prisma.brandProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: 'Temp', // Will be updated from step 1
        budgetRange: data.budgetRange,
        preferences: {
          platforms: data.platforms,
          influencerTypes: data.influencerTypes,
          collaborationStyle: data.collaborationStyle,
        },
      },
      update: {
        budgetRange: data.budgetRange,
        preferences: {
          platforms: data.platforms,
          influencerTypes: data.influencerTypes,
          collaborationStyle: data.collaborationStyle,
        },
      },
    });

    // Mark onboarding as completed
    await this.updateProgress(userId, 3, data, true);
    return { success: true, completed: true };
  }

  // Helper methods
  private async updateProgress(userId: string, step: number, data: any, completed = false) {
    const currentProgress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    const completedSteps = currentProgress?.completedSteps as number[] || [];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }

    const currentData = (currentProgress?.data as any) || {};

    await this.prisma.onboardingProgress.upsert({
      where: { userId },
      create: {
        userId,
        currentStep: completed ? step : step + 1,
        completedSteps,
        isCompleted: completed,
        data: { ...currentData, [`step${step}`]: data },
      },
      update: {
        currentStep: completed ? step : step + 1,
        completedSteps,
        isCompleted: completed,
        data: { ...currentData, [`step${step}`]: data },
      },
    });
  }

  private parseFollowerCount(followers: string): number {
    // Convert "532K" to 532000, "1.2M" to 1200000, etc.
    const num = parseFloat(followers.replace(/[^0-9.]/g, ''));
    if (followers.toLowerCase().includes('k')) return Math.floor(num * 1000);
    if (followers.toLowerCase().includes('m')) return Math.floor(num * 1000000);
    return Math.floor(num);
  }

  async skipStep(userId: string, step: number) {
    const progress = await this.getProgress(userId);
    await this.updateProgress(userId, step, { skipped: true });
    return { success: true, nextStep: step + 1 };
  }
}
