import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto } from './dto/portfolio.dto';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  // Public endpoints (no authentication required)
  @Get('public/:userId')
  @ApiOperation({ summary: 'Get public portfolio for specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getPublicPortfolio(@Param('userId') userId: string) {
    return this.portfolioService.getPublicPortfolioByUserId(userId);
  }

  // Protected endpoints (authentication required)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get current user portfolio items' })
  async getMyPortfolio(@Req() req: any) {
    return this.portfolioService.getPortfolioByUserId(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create new portfolio item' })
  async createPortfolioItem(@Req() req: any, @Body() dto: CreatePortfolioItemDto) {
    return this.portfolioService.createPortfolioItem(req.user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @ApiOperation({ summary: 'Update portfolio item' })
  @ApiParam({ name: 'id', description: 'Portfolio item ID' })
  async updatePortfolioItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePortfolioItemDto
  ) {
    return this.portfolioService.updatePortfolioItem(req.user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete portfolio item' })
  @ApiParam({ name: 'id', description: 'Portfolio item ID' })
  async deletePortfolioItem(@Req() req: any, @Param('id') id: string) {
    return this.portfolioService.deletePortfolioItem(req.user.id, id);
  }
}