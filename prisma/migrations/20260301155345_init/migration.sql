-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "marketStructure" TEXT NOT NULL,
    "keyLevel" TEXT NOT NULL,
    "trendDescription" TEXT NOT NULL,
    "htfBias" TEXT NOT NULL,
    "biasReasoning" TEXT NOT NULL,
    "weeklySupport" TEXT NOT NULL,
    "weeklyResistance" TEXT NOT NULL,
    "weeklyPOI" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WeeklyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "weeklyAnalysisId" TEXT,
    "dailyBias" TEXT NOT NULL,
    "dailyMarketStructure" TEXT NOT NULL,
    "alignedWithHTF" BOOLEAN NOT NULL,
    "asianSessionNotes" TEXT,
    "londonSessionNotes" TEXT,
    "nySessionNotes" TEXT,
    "dailySupport" TEXT NOT NULL,
    "dailyResistance" TEXT NOT NULL,
    "dailyPOI" TEXT NOT NULL,
    "maxTrades" INTEGER NOT NULL DEFAULT 3,
    "riskPerTrade" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tradePlan" TEXT NOT NULL,
    "reviewNotes" TEXT,
    "followedPlan" BOOLEAN,
    "emotionalState" TEXT,
    "lessonLearned" TEXT,

    CONSTRAINT "DailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyPlanId" TEXT,
    "pair" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION NOT NULL,
    "takeProfit" DOUBLE PRECISION NOT NULL,
    "positionSize" DOUBLE PRECISION NOT NULL,
    "riskRewardRatio" DOUBLE PRECISION NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3),
    "exitPrice" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "alignedWithHTF" BOOLEAN NOT NULL,
    "alignedWithDaily" BOOLEAN NOT NULL,
    "setupType" TEXT NOT NULL,
    "pnl" DOUBLE PRECISION,
    "pnlPercentage" DOUBLE PRECISION,
    "entryReason" TEXT NOT NULL,
    "exitReason" TEXT,
    "screenshot" TEXT,
    "mistakes" TEXT,
    "lessonsLearned" TEXT,
    "emotionalState" TEXT,
    "rating" INTEGER,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "WeeklyAnalysis" ADD CONSTRAINT "WeeklyAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlan" ADD CONSTRAINT "DailyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlan" ADD CONSTRAINT "DailyPlan_weeklyAnalysisId_fkey" FOREIGN KEY ("weeklyAnalysisId") REFERENCES "WeeklyAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
