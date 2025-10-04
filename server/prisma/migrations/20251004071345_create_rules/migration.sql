-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('PERCENTAGE', 'SPECIFIC', 'HYBRID');

-- CreateTable
CREATE TABLE "ApprovalRule" (
    "id" SERIAL NOT NULL,
    "flowId" INTEGER NOT NULL,
    "rule_type" "RuleType" NOT NULL,
    "threshold_percentage" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "ApprovalFlow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
