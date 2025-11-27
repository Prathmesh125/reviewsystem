-- CreateTable
CREATE TABLE "ai_review_generations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "enhancedText" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "aiModel" TEXT NOT NULL DEFAULT 'gemini-pro',
    "sentiment" TEXT,
    "keywords" TEXT,
    "improvements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "rejectionNote" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    CONSTRAINT "ai_review_generations_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_prompt_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "promptText" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'REVIEW_ENHANCEMENT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "variables" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_prompt_templates_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_usage_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "operation" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "responseTime" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "estimatedCost" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_usage_analytics_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "business_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "targetDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "progressPercent" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "business_goals_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "business_milestones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "achievedAt" DATETIME,
    CONSTRAINT "business_milestones_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "business_goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "business_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "actionable" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    CONSTRAINT "business_insights_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "industry_benchmarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "industry" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'MONTHLY',
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "paymentIntentId" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "cancelledAt" DATETIME,
    "features" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_businesses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "brandColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "logo" TEXT,
    "customMessage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "googleReviewUrl" TEXT,
    "enableSmartFilter" BOOLEAN NOT NULL DEFAULT false,
    "activeFormId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "businesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_businesses" ("activeFormId", "address", "brandColor", "createdAt", "customMessage", "description", "googleReviewUrl", "id", "isPublished", "logo", "name", "phone", "type", "updatedAt", "userId", "website") SELECT "activeFormId", "address", "brandColor", "createdAt", "customMessage", "description", "googleReviewUrl", "id", "isPublished", "logo", "name", "phone", "type", "updatedAt", "userId", "website" FROM "businesses";
DROP TABLE "businesses";
ALTER TABLE "new_businesses" RENAME TO "businesses";
CREATE INDEX "businesses_userId_idx" ON "businesses"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ai_review_generations_reviewId_key" ON "ai_review_generations"("reviewId");

-- CreateIndex
CREATE INDEX "ai_review_generations_reviewId_idx" ON "ai_review_generations"("reviewId");

-- CreateIndex
CREATE INDEX "ai_review_generations_status_idx" ON "ai_review_generations"("status");

-- CreateIndex
CREATE INDEX "ai_review_generations_generatedAt_idx" ON "ai_review_generations"("generatedAt");

-- CreateIndex
CREATE INDEX "ai_prompt_templates_businessId_idx" ON "ai_prompt_templates"("businessId");

-- CreateIndex
CREATE INDEX "ai_prompt_templates_category_idx" ON "ai_prompt_templates"("category");

-- CreateIndex
CREATE INDEX "ai_prompt_templates_isActive_idx" ON "ai_prompt_templates"("isActive");

-- CreateIndex
CREATE INDEX "ai_usage_analytics_businessId_idx" ON "ai_usage_analytics"("businessId");

-- CreateIndex
CREATE INDEX "ai_usage_analytics_operation_idx" ON "ai_usage_analytics"("operation");

-- CreateIndex
CREATE INDEX "ai_usage_analytics_createdAt_idx" ON "ai_usage_analytics"("createdAt");

-- CreateIndex
CREATE INDEX "business_goals_businessId_idx" ON "business_goals"("businessId");

-- CreateIndex
CREATE INDEX "business_goals_status_idx" ON "business_goals"("status");

-- CreateIndex
CREATE INDEX "business_goals_type_idx" ON "business_goals"("type");

-- CreateIndex
CREATE INDEX "business_milestones_goalId_idx" ON "business_milestones"("goalId");

-- CreateIndex
CREATE INDEX "business_insights_businessId_idx" ON "business_insights"("businessId");

-- CreateIndex
CREATE INDEX "business_insights_type_idx" ON "business_insights"("type");

-- CreateIndex
CREATE INDEX "business_insights_isRead_idx" ON "business_insights"("isRead");

-- CreateIndex
CREATE INDEX "business_insights_createdAt_idx" ON "business_insights"("createdAt");

-- CreateIndex
CREATE INDEX "industry_benchmarks_industry_idx" ON "industry_benchmarks"("industry");

-- CreateIndex
CREATE INDEX "industry_benchmarks_metricType_idx" ON "industry_benchmarks"("metricType");

-- CreateIndex
CREATE UNIQUE INDEX "industry_benchmarks_industry_metricType_period_key" ON "industry_benchmarks"("industry", "metricType", "period");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_businessId_key" ON "subscriptions"("businessId");

-- CreateIndex
CREATE INDEX "subscriptions_businessId_idx" ON "subscriptions"("businessId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "subscriptions"("endDate");
