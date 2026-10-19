-- CreateTable
CREATE TABLE "RevisionRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paperId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "revisionType" TEXT NOT NULL,
    "reviewReport" TEXT NOT NULL,
    "commentsToAuthor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" DATETIME,
    "submittedAt" DATETIME,
    "revisionFilePath" TEXT,
    "revisionFileName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RevisionRequest_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RevisionRequest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RevisionRequest_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubmissionDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "revisionRequestId" TEXT,
    "manuscriptId" TEXT,
    "title" TEXT,
    "abstract" TEXT,
    "keywords" TEXT,
    "mainFilePath" TEXT,
    "mainFileName" TEXT,
    "supplementaryFilePath" TEXT,
    "supplementaryFileName" TEXT,
    "contributors" TEXT,
    "editorMessage" TEXT,
    "conflictOfInterest" TEXT,
    "reviewerSuggestions" TEXT,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubmissionDraft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubmissionDraft_revisionRequestId_fkey" FOREIGN KEY ("revisionRequestId") REFERENCES "RevisionRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SubmissionDraft" ("abstract", "authorId", "conflictOfInterest", "contributors", "createdAt", "currentStep", "editorMessage", "id", "keywords", "mainFileName", "mainFilePath", "manuscriptId", "reviewerSuggestions", "status", "supplementaryFileName", "supplementaryFilePath", "title", "updatedAt") SELECT "abstract", "authorId", "conflictOfInterest", "contributors", "createdAt", "currentStep", "editorMessage", "id", "keywords", "mainFileName", "mainFilePath", "manuscriptId", "reviewerSuggestions", "status", "supplementaryFileName", "supplementaryFilePath", "title", "updatedAt" FROM "SubmissionDraft";
DROP TABLE "SubmissionDraft";
ALTER TABLE "new_SubmissionDraft" RENAME TO "SubmissionDraft";
CREATE INDEX "SubmissionDraft_authorId_idx" ON "SubmissionDraft"("authorId");
CREATE INDEX "SubmissionDraft_updatedAt_idx" ON "SubmissionDraft"("updatedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RevisionRequest_paperId_idx" ON "RevisionRequest"("paperId");

-- CreateIndex
CREATE INDEX "RevisionRequest_authorId_idx" ON "RevisionRequest"("authorId");

-- CreateIndex
CREATE INDEX "RevisionRequest_editorId_idx" ON "RevisionRequest"("editorId");

-- CreateIndex
CREATE INDEX "RevisionRequest_status_idx" ON "RevisionRequest"("status");

-- CreateIndex
CREATE INDEX "RevisionRequest_revisionType_idx" ON "RevisionRequest"("revisionType");
