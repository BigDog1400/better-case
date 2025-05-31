/*
  Warnings:

  - You are about to drop the column `name` on the `AreaOfLaw` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `AreaOfLaw` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `AreaOfLaw` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AreaOfLaw_name_key";

-- AlterTable
ALTER TABLE "AreaOfLaw" DROP COLUMN "name",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AreaOfLaw_code_key" ON "AreaOfLaw"("code");
