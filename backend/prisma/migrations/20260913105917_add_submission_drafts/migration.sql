-- CreateTable
CREATE TABLE "SubmissionDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "manuscriptId" TEXT,
    "title" TEXT,
    "abstract" TEXT,
    "keywords" TEXT,
    "mainFilePath" TEXT,
    "supplementaryFilePath" TEXT,
    "contributors" TEXT,
    "editorMessage" TEXT,
    "conflictOfInterest" TEXT,
    "reviewerSuggestions" TEXT,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubmissionDraft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SubmissionDraft_authorId_idx" ON "SubmissionDraft"("authorId");

-- CreateIndex
CREATE INDEX "SubmissionDraft_updatedAt_idx" ON "SubmissionDraft"("updatedAt");
