/*
  Warnings:

  - The primary key for the `LeaveBalance` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "reportingManagerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "LeaveBalance" DROP CONSTRAINT "LeaveBalance_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "Employee"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;
