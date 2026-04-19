-- CreateTable
CREATE TABLE "CodeReview" (
    "id" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "aiScore" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "suggestions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeReview_solutionId_key" ON "CodeReview"("solutionId");
