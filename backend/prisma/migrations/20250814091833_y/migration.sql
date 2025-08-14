/*
  Warnings:

  - A unique constraint covering the columns `[user_id,platform]` on the table `social_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."InquiryStatus" AS ENUM ('PENDING', 'CONTACTED', 'NEGOTIATING', 'ACCEPTED', 'DECLINED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'INVALID_URL', 'DELETED');

-- AlterTable
ALTER TABLE "public"."brand_profiles" ADD COLUMN     "brandValues" TEXT,
ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "contact_phone" TEXT;

-- AlterTable
ALTER TABLE "public"."campaigns" ADD COLUMN     "approval_instructions" TEXT,
ADD COLUMN     "auto_approve_influencers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "content_brief" TEXT,
ADD COLUMN     "max_influencers" INTEGER,
ADD COLUMN     "requires_approval" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."campaign_files" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" BIGINT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."published_posts" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "post_url" TEXT NOT NULL,
    "platform_post_id" TEXT,
    "post_type" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."PostStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "published_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_performance" (
    "published_post_id" TEXT NOT NULL,
    "views" BIGINT NOT NULL DEFAULT 0,
    "likes" BIGINT NOT NULL DEFAULT 0,
    "comments" BIGINT NOT NULL DEFAULT 0,
    "shares" BIGINT NOT NULL DEFAULT 0,
    "saves" BIGINT NOT NULL DEFAULT 0,
    "clicks" BIGINT NOT NULL DEFAULT 0,
    "impressions" BIGINT NOT NULL DEFAULT 0,
    "reach" BIGINT NOT NULL DEFAULT 0,
    "engagement_rate" DECIMAL(5,2),
    "ctr" DECIMAL(5,2),
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_performance_pkey" PRIMARY KEY ("published_post_id")
);

-- CreateTable
CREATE TABLE "public"."portfolio_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "brand_name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "post_url" TEXT,
    "views" BIGINT DEFAULT 0,
    "likes" BIGINT DEFAULT 0,
    "shares" BIGINT DEFAULT 0,
    "comments" BIGINT DEFAULT 0,
    "engagement" DECIMAL(5,2),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."influencer_packages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "package_type" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "deliverables" JSONB NOT NULL DEFAULT '[]',
    "turnaround_days" INTEGER,
    "revisions" INTEGER DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencer_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inquiries" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "influencer_id" TEXT NOT NULL,
    "package_id" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "brand_email" TEXT NOT NULL,
    "brand_phone" TEXT,
    "campaign_budget" DECIMAL(10,2),
    "timeline" TEXT,
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "status" "public"."InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "brand_response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_user_id_platform_key" ON "public"."social_accounts"("user_id", "platform");

-- AddForeignKey
ALTER TABLE "public"."campaign_files" ADD CONSTRAINT "campaign_files_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."published_posts" ADD CONSTRAINT "published_posts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_performance" ADD CONSTRAINT "post_performance_published_post_id_fkey" FOREIGN KEY ("published_post_id") REFERENCES "public"."published_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."portfolio_items" ADD CONSTRAINT "portfolio_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."influencer_packages" ADD CONSTRAINT "influencer_packages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiries" ADD CONSTRAINT "inquiries_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiries" ADD CONSTRAINT "inquiries_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiries" ADD CONSTRAINT "inquiries_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."influencer_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
