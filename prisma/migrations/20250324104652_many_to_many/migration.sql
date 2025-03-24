/*
  Warnings:

  - You are about to drop the column `developerId` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `developerId` on the `CaseHome` table. All the data in the column will be lost.
  - You are about to drop the column `caseHomeId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `caseId` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_developerId_fkey";

-- DropForeignKey
ALTER TABLE "CaseHome" DROP CONSTRAINT "CaseHome_developerId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_caseHomeId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_caseId_fkey";

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "developerId";

-- AlterTable
ALTER TABLE "CaseHome" DROP COLUMN "developerId";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "caseHomeId",
DROP COLUMN "caseId";

-- CreateTable
CREATE TABLE "_DeveloperCases" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CaseCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DeveloperCaseHomes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CaseHomeCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DeveloperCases_AB_unique" ON "_DeveloperCases"("A", "B");

-- CreateIndex
CREATE INDEX "_DeveloperCases_B_index" ON "_DeveloperCases"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CaseCategories_AB_unique" ON "_CaseCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_CaseCategories_B_index" ON "_CaseCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DeveloperCaseHomes_AB_unique" ON "_DeveloperCaseHomes"("A", "B");

-- CreateIndex
CREATE INDEX "_DeveloperCaseHomes_B_index" ON "_DeveloperCaseHomes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CaseHomeCategories_AB_unique" ON "_CaseHomeCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_CaseHomeCategories_B_index" ON "_CaseHomeCategories"("B");

-- AddForeignKey
ALTER TABLE "_DeveloperCases" ADD CONSTRAINT "_DeveloperCases_A_fkey" FOREIGN KEY ("A") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperCases" ADD CONSTRAINT "_DeveloperCases_B_fkey" FOREIGN KEY ("B") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseCategories" ADD CONSTRAINT "_CaseCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseCategories" ADD CONSTRAINT "_CaseCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperCaseHomes" ADD CONSTRAINT "_DeveloperCaseHomes_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperCaseHomes" ADD CONSTRAINT "_DeveloperCaseHomes_B_fkey" FOREIGN KEY ("B") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseHomeCategories" ADD CONSTRAINT "_CaseHomeCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseHomeCategories" ADD CONSTRAINT "_CaseHomeCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
