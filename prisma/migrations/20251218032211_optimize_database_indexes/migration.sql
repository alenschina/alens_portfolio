-- CreateIndex
CREATE INDEX "Category_order_idx" ON "Category"("order");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- CreateIndex
CREATE INDEX "CategoryImage_order_idx" ON "CategoryImage"("order");

-- CreateIndex
CREATE INDEX "CategoryImage_carouselOrder_idx" ON "CategoryImage"("carouselOrder");

-- CreateIndex
CREATE INDEX "CategoryImage_categoryId_isCarousel_idx" ON "CategoryImage"("categoryId", "isCarousel");

-- CreateIndex
CREATE INDEX "Image_order_idx" ON "Image"("order");

-- CreateIndex
CREATE INDEX "Image_createdAt_idx" ON "Image"("createdAt");

-- CreateIndex
CREATE INDEX "Image_mimeType_idx" ON "Image"("mimeType");

-- CreateIndex
CREATE INDEX "Navigation_parentId_idx" ON "Navigation"("parentId");

-- CreateIndex
CREATE INDEX "Navigation_order_idx" ON "Navigation"("order");

-- CreateIndex
CREATE INDEX "Navigation_isVisible_idx" ON "Navigation"("isVisible");

-- CreateIndex
CREATE INDEX "Navigation_type_idx" ON "Navigation"("type");
