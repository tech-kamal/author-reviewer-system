-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubmissionDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
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
    CONSTRAINT "SubmissionDraft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubmissionDraft" ("abstract", "authorId", "conflictOfInterest", "contributors", "createdAt", "currentStep", "editorMessage", "id", "keywords", "mainFileName", "mainFilePath", "manuscriptId", "reviewerSuggestions", "supplementaryFileName", "supplementaryFilePath", "title", "updatedAt") SELECT "abstract", "authorId", "conflictOfInterest", "contributors", "createdAt", "currentStep", "editorMessage", "id", "keywords", "mainFileName", "mainFilePath", "manuscriptId", "reviewerSuggestions", "supplementaryFileName", "supplementaryFilePath", "title", "updatedAt" FROM "SubmissionDraft";
DROP TABLE "SubmissionDraft";
ALTER TABLE "new_SubmissionDraft" RENAME TO "SubmissionDraft";
CREATE INDEX "SubmissionDraft_authorId_idx" ON "SubmissionDraft"("authorId");
CREATE INDEX "SubmissionDraft_updatedAt_idx" ON "SubmissionDraft"("updatedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
