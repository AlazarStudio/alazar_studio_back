/*
  Warnings:

  - You are about to drop the `_DeveloperCaseHomes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DeveloperCases` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DeveloperCaseHomes" DROP CONSTRAINT "_DeveloperCaseHomes_A_fkey";

-- DropForeignKey
ALTER TABLE "_DeveloperCaseHomes" DROP CONSTRAINT "_DeveloperCaseHomes_B_fkey";

-- DropForeignKey
ALTER TABLE "_DeveloperCases" DROP CONSTRAINT "_DeveloperCases_A_fkey";

-- DropForeignKey
ALTER TABLE "_DeveloperCases" DROP CONSTRAINT "_DeveloperCases_B_fkey";

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "developerId" INTEGER;

-- AlterTable
ALTER TABLE "CaseHome" ADD COLUMN     "developerId" INTEGER;

-- DropTable
DROP TABLE "_DeveloperCaseHomes";

-- DropTable
DROP TABLE "_DeveloperCases";

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseHome" ADD CONSTRAINT "CaseHome_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
