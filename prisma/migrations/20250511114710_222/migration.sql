-- AlterTable
ALTER TABLE "_CaseCategories" ADD CONSTRAINT "_CaseCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CaseCategories_AB_unique";

-- AlterTable
ALTER TABLE "_CaseDevelopers" ADD CONSTRAINT "_CaseDevelopers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CaseDevelopers_AB_unique";

-- AlterTable
ALTER TABLE "_CaseHomeCategories" ADD CONSTRAINT "_CaseHomeCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CaseHomeCategories_AB_unique";

-- AlterTable
ALTER TABLE "_CaseHomeDevelopers" ADD CONSTRAINT "_CaseHomeDevelopers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CaseHomeDevelopers_AB_unique";

-- AlterTable
ALTER TABLE "_ShopCategories" ADD CONSTRAINT "_ShopCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ShopCategories_AB_unique";
