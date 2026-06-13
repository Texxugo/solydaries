-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'REJECTED', 'PUBLISHED', 'CLOSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CampaignCategory" AS ENUM ('FOOD', 'CLOTHING', 'HEALTH', 'EDUCATION', 'HOUSING', 'ANIMALS', 'ENVIRONMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('ITEM_DONATION', 'VOLUNTEER', 'EXTERNAL_FINANCIAL');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CampaignCategory" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "supportTypes" "SupportType"[],
    "goalDescription" TEXT NOT NULL,
    "supportInstructions" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "ownerPersonId" TEXT,
    "ownerOrganizationId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ownerOrganizationId_fkey" FOREIGN KEY ("ownerOrganizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
