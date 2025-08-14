import { Controller, Get, Put, Post, UseGuards, Req, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserProfileDto, UpdateBrandProfileDto } from './dto/users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (public profile)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get(':id/influencer-profile')
  @ApiOperation({ summary: 'Get comprehensive influencer public profile' })
  @ApiParam({ name: 'id', description: 'Influencer User ID' })
  async getInfluencerProfile(@Param('id') id: string) {
    return this.usersService.getInfluencerPublicProfile(id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Req() req: any, @Body() updateData: UpdateUserProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  @Put('brand-profile')
  @ApiOperation({ summary: 'Update current user brand profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Brand profile updated successfully' })
  async updateBrandProfile(@Req() req: any, @Body() updateData: UpdateBrandProfileDto) {
    // Ensure only brands can update brand profile
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can update brand profile');
    }
    return this.usersService.updateBrandProfile(req.user.id, updateData);
  }

  @Post('upload-logo')
  @ApiOperation({ summary: 'Upload brand logo' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('logo'))
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  async uploadLogo(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    // Ensure only brands can upload logos
    if (req.user.role !== 'BRAND') {
      throw new Error('Only brands can upload logos');
    }
    return this.usersService.uploadLogo(req.user.id, file);
  }

  @Post('upload-avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadAvatar(req.user.id, file);
  }
}
