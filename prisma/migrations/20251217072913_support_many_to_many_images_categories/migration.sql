/*
  Warnings:

  - You are about to drop the column `carouselOrder` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `isCarousel` on the `Image` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CategoryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isCarousel" BOOLEAN NOT NULL DEFAULT false,
    "carouselOrder" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CategoryImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CategoryImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "alt" TEXT NOT NULL,
    "description" TEXT,
    "originalUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "mimeType" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Image" ("alt", "createdAt", "description", "height", "id", "isVisible", "mimeType", "order", "originalUrl", "size", "thumbnailUrl", "title", "updatedAt", "width") SELECT "alt", "createdAt", "description", "height", "id", "isVisible", "mimeType", "order", "originalUrl", "size", "thumbnailUrl", "title", "updatedAt", "width" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE INDEX "Image_isVisible_idx" ON "Image"("isVisible");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CategoryImage_categoryId_idx" ON "CategoryImage"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryImage_imageId_idx" ON "CategoryImage"("imageId");

-- CreateIndex
CREATE INDEX "CategoryImage_isCarousel_idx" ON "CategoryImage"("isCarousel");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryImage_imageId_categoryId_key" ON "CategoryImage"("imageId", "categoryId");
