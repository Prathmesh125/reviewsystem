-- CreateTable
CREATE TABLE "qr_scans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qrCodeId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qr_scans_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_qr_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "qrCodeUrl" TEXT NOT NULL,
    "qrImageUrl" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Leave us a review',
    "scansCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "foregroundColor" TEXT NOT NULL DEFAULT '#000000',
    "size" INTEGER NOT NULL DEFAULT 300,
    "logoUrl" TEXT,
    "errorCorrection" TEXT NOT NULL DEFAULT 'M',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "qr_codes_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_qr_codes" ("backgroundColor", "businessId", "createdAt", "foregroundColor", "id", "isActive", "logoUrl", "qrCodeUrl", "qrImageUrl", "scansCount", "size", "title", "updatedAt") SELECT "backgroundColor", "businessId", "createdAt", "foregroundColor", "id", "isActive", "logoUrl", "qrCodeUrl", "qrImageUrl", "scansCount", "size", "title", "updatedAt" FROM "qr_codes";
DROP TABLE "qr_codes";
ALTER TABLE "new_qr_codes" RENAME TO "qr_codes";
CREATE INDEX "qr_codes_businessId_idx" ON "qr_codes"("businessId");
CREATE INDEX "qr_codes_isActive_idx" ON "qr_codes"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "qr_scans_qrCodeId_idx" ON "qr_scans"("qrCodeId");

-- CreateIndex
CREATE INDEX "qr_scans_scannedAt_idx" ON "qr_scans"("scannedAt");
