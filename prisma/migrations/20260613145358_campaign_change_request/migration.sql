-- CreateEnum
CREATE TYPE "CampaignChangeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "campaign_change_requests" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "status" "CampaignChangeStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CampaignCategory" NOT NULL,
    "supportTypes" "SupportType"[],
    "goalDescription" TEXT NOT NULL,
    "supportInstructions" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "logisticsDetails" TEXT,
    "deadline" TIMESTAMP(3),
    "decisionReason" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_change_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "campaign_change_requests" ADD CONSTRAINT "campaign_change_requests_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_change_requests" ADD CONSTRAINT "campaign_change_requests_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_change_requests" ADD CONSTRAINT "campaign_change_requests_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
