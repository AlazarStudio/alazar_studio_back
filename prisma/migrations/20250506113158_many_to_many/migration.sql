/*
  Warnings:

  - You are about to drop the column `developerId` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `developerId` on the `CaseHome` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_developerId_fkey";

-- DropForeignKey
ALTER TABLE "CaseHome" DROP CONSTRAINT "CaseHome_developerId_fkey";

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "developerId";

-- AlterTable
ALTER TABLE "CaseHome" DROP COLUMN "developerId";

-- CreateTable
CREATE TABLE "_CaseDevelopers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CaseHomeDevelopers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CaseDevelopers_AB_unique" ON "_CaseDevelopers"("A", "B");

-- CreateIndex
CREATE INDEX "_CaseDevelopers_B_index" ON "_CaseDevelopers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CaseHomeDevelopers_AB_unique" ON "_CaseHomeDevelopers"("A", "B");

-- CreateIndex
CREATE INDEX "_CaseHomeDevelopers_B_index" ON "_CaseHomeDevelopers"("B");

-- AddForeignKey
ALTER TABLE "_CaseDevelopers" ADD CONSTRAINT "_CaseDevelopers_A_fkey" FOREIGN KEY ("A") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseDevelopers" ADD CONSTRAINT "_CaseDevelopers_B_fkey" FOREIGN KEY ("B") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseHomeDevelopers" ADD CONSTRAINT "_CaseHomeDevelopers_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseHomeDevelopers" ADD CONSTRAINT "_CaseHomeDevelopers_B_fkey" FOREIGN KEY ("B") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
