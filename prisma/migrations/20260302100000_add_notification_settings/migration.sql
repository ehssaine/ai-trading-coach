-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT,
    "reportTime" TEXT NOT NULL DEFAULT '07:00',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "includeTradeStats" BOOLEAN NOT NULL DEFAULT true,
    "includeDailyPlan" BOOLEAN NOT NULL DEFAULT true,
    "includeHabitReminder" BOOLEAN NOT NULL DEFAULT true,
    "includeAiInsights" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
