-- AlterTable
ALTER TABLE "Case" ALTER COLUMN "website" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CaseHome" ADD COLUMN     "website" TEXT;
