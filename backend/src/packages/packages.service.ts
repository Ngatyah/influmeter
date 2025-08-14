import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/packages.dto';
import { convertBigIntsToNumbers } from '../common/utils/bigint.util';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async getPackagesByUserId(userId: string) {
    const packages = await this.prisma.influencerPackage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return convertBigIntsToNumbers(packages);
  }

  async createPackage(userId: string, dto: CreatePackageDto) {
    const packageItem = await this.prisma.influencerPackage.create({
      data: {
        userId,
        platform: dto.platform,
        packageType: dto.packageType,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        deliverables: dto.deliverables,
        turnaroundDays: dto.turnaroundDays,
        revisions: dto.revisions || 1,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    return convertBigIntsToNumbers(packageItem);
  }

  async updatePackage(userId: string, id: string, dto: UpdatePackageDto) {
    // Check if the package belongs to the user
    const existing = await this.prisma.influencerPackage.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Package not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only update your own packages');
    }

    const updateData: any = {};
    
    if (dto.platform !== undefined) updateData.platform = dto.platform;
    if (dto.packageType !== undefined) updateData.packageType = dto.packageType;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.deliverables !== undefined) updateData.deliverables = dto.deliverables;
    if (dto.turnaroundDays !== undefined) updateData.turnaroundDays = dto.turnaroundDays;
    if (dto.revisions !== undefined) updateData.revisions = dto.revisions;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updatedPackage = await this.prisma.influencerPackage.update({
      where: { id },
      data: updateData,
    });

    return convertBigIntsToNumbers(updatedPackage);
  }

  async deletePackage(userId: string, id: string) {
    // Check if the package belongs to the user
    const existing = await this.prisma.influencerPackage.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Package not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only delete your own packages');
    }

    await this.prisma.influencerPackage.delete({
      where: { id },
    });

    return { message: 'Package deleted successfully' };
  }

  async getPublicPackagesByUserId(userId: string) {
    // Get only active packages for public viewing
    const packages = await this.prisma.influencerPackage.findMany({
      where: { 
        userId,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
    });

    return convertBigIntsToNumbers(packages);
  }
}