/*
  Warnings:

  - A unique constraint covering the columns `[manuscriptId]` on the table `Paper` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Paper" ADD COLUMN "manuscriptId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Paper_manuscriptId_key" ON "Paper"("manuscriptId");
