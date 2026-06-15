-- CreateEnum
CREATE TYPE "OrganizationPostStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'SUSPENDED');

-- CreateTable
CREATE TABLE "organization_posts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" "OrganizationPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "content" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "videoUrl" TEXT,
    "statusReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_postId_donorId_key" ON "post_reactions"("postId", "donorId");

-- AddForeignKey
ALTER TABLE "organization_posts" ADD CONSTRAINT "organization_posts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_posts" ADD CONSTRAINT "organization_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "organization_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
