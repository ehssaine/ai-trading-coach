-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "marketStructure" TEXT NOT NULL,
    "keyLevel" TEXT NOT NULL,
    "trendDescription" TEXT NOT NULL,
    "htfBias" TEXT NOT NULL,
    "biasReasoning" TEXT NOT NULL,
    "weeklySupport" TEXT NOT NULL,
    "weeklyResistance" TEXT NOT NULL,
    "weeklyPOI" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "WeeklyAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
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
    "riskPerTrade" REAL NOT NULL DEFAULT 1.0,
    "tradePlan" TEXT NOT NULL,
    "reviewNotes" TEXT,
    "followedPlan" BOOLEAN,
    "emotionalState" TEXT,
    "lessonLearned" TEXT,
    CONSTRAINT "DailyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyPlan_weeklyAnalysisId_fkey" FOREIGN KEY ("weeklyAnalysisId") REFERENCES "WeeklyAnalysis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dailyPlanId" TEXT,
    "pair" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entryPrice" REAL NOT NULL,
    "stopLoss" REAL NOT NULL,
    "takeProfit" REAL NOT NULL,
    "positionSize" REAL NOT NULL,
    "riskRewardRatio" REAL NOT NULL,
    "entryTime" DATETIME NOT NULL,
    "exitTime" DATETIME,
    "exitPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "alignedWithHTF" BOOLEAN NOT NULL,
    "alignedWithDaily" BOOLEAN NOT NULL,
    "setupType" TEXT NOT NULL,
    "pnl" REAL,
    "pnlPercentage" REAL,
    "entryReason" TEXT NOT NULL,
    "exitReason" TEXT,
    "screenshot" TEXT,
    "mistakes" TEXT,
    "lessonsLearned" TEXT,
    "emotionalState" TEXT,
    "rating" INTEGER,
    CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trade_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
