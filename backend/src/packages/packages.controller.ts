import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/packages.dto';

@ApiTags('Packages')
@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  // Public endpoints (no authentication required)
  @Get('public/:userId')
  @ApiOperation({ summary: 'Get public packages for specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getPublicPackages(@Param('userId') userId: string) {
    return this.packagesService.getPublicPackagesByUserId(userId);
  }

  // Protected endpoints (authentication required)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get current user packages' })
  async getMyPackages(@Req() req: any) {
    return this.packagesService.getPackagesByUserId(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create new package' })
  async createPackage(@Req() req: any, @Body() dto: CreatePackageDto) {
    return this.packagesService.createPackage(req.user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @ApiOperation({ summary: 'Update package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  async updatePackage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto
  ) {
    return this.packagesService.updatePackage(req.user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  async deletePackage(@Req() req: any, @Param('id') id: string) {
    return this.packagesService.deletePackage(req.user.id, id);
  }
}