import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import { SocialController } from './social.controller'
import { SocialService } from './social.service'
import { SocialScheduler } from './social.scheduler'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    PrismaModule,
    CacheModule.register({
      ttl: 5 * 60 * 1000, // 5 minutes default TTL
      max: 1000, // maximum number of items in cache
    }),
  ],
  controllers: [SocialController],
  providers: [SocialService, SocialScheduler],
  exports: [SocialService],
})
export class SocialModule {}