/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "LeaveBalance" DROP CONSTRAINT "LeaveBalance_employeeId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey" CASCADE,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("employeeId");

-- AlterTable
ALTER TABLE "LeaveBalance" ALTER COLUMN "employeeId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;
