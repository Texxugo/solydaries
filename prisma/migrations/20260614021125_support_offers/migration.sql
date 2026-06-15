-- CreateEnum
CREATE TYPE "SupportOfferType" AS ENUM ('ITEM_DONATION', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "SupportOfferStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DONOR_CANCELLED', 'MANAGER_DECLINED');

-- CreateTable
CREATE TABLE "support_offers" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "type" "SupportOfferType" NOT NULL,
    "status" "SupportOfferStatus" NOT NULL DEFAULT 'PENDING',
    "publiclyAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "contact" TEXT NOT NULL,
    "itemName" TEXT,
    "itemQuantity" TEXT,
    "itemCondition" TEXT,
    "coordinationPreference" TEXT,
    "availability" TEXT,
    "helpType" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_offers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "support_offers" ADD CONSTRAINT "support_offers_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_offers" ADD CONSTRAINT "support_offers_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
