-- CreateTable
CREATE TABLE "EditorInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "EditorInvitation_tokenHash_key" ON "EditorInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "EditorInvitation_email_idx" ON "EditorInvitation"("email");
