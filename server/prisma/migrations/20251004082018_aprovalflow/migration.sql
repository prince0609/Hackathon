/*
  Warnings:

  - You are about to drop the column `companyId` on the `ApprovalFlow` table. All the data in the column will be lost.
  - Added the required column `userId` to the `ApprovalFlow` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ApprovalFlow" DROP CONSTRAINT "ApprovalFlow_companyId_fkey";

-- AlterTable
ALTER TABLE "ApprovalFlow" DROP COLUMN "companyId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ApprovalFlow" ADD CONSTRAINT "ApprovalFlow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
