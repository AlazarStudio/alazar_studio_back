-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "img" TEXT[],
    "price" INTEGER,
    "website" TEXT,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShopCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ShopCategories_AB_unique" ON "_ShopCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_ShopCategories_B_index" ON "_ShopCategories"("B");

-- AddForeignKey
ALTER TABLE "_ShopCategories" ADD CONSTRAINT "_ShopCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShopCategories" ADD CONSTRAINT "_ShopCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
