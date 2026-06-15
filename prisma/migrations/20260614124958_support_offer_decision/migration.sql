-- AlterTable
ALTER TABLE "support_offers" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decidedById" TEXT,
ADD COLUMN     "declineReason" TEXT;

-- AddForeignKey
ALTER TABLE "support_offers" ADD CONSTRAINT "support_offers_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
