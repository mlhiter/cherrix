-- AlterTable
ALTER TABLE "DocItem" ADD COLUMN     "baseUrl" TEXT,
ADD COLUMN     "lastUpdated" TEXT,
ADD COLUMN     "textContent" TEXT;

-- CreateTable
CREATE TABLE "DocImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "docItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocTableOfContents" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "docItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocTableOfContents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocImage_docItemId_idx" ON "DocImage"("docItemId");

-- CreateIndex
CREATE INDEX "DocTableOfContents_docItemId_idx" ON "DocTableOfContents"("docItemId");

-- AddForeignKey
ALTER TABLE "DocImage" ADD CONSTRAINT "DocImage_docItemId_fkey" FOREIGN KEY ("docItemId") REFERENCES "DocItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocTableOfContents" ADD CONSTRAINT "DocTableOfContents_docItemId_fkey" FOREIGN KEY ("docItemId") REFERENCES "DocItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
