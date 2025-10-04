-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ExpenseApproval" (
    "id" SERIAL NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "approverId" INTEGER NOT NULL,
    "step_order" INTEGER NOT NULL,
    "status" "ApprovalStatus" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseApproval_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExpenseApproval" ADD CONSTRAINT "ExpenseApproval_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseApproval" ADD CONSTRAINT "ExpenseApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
