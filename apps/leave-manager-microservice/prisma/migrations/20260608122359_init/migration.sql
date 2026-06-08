/*
  Warnings:

  - You are about to drop the column `reason` on the `LeaveRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LeaveRequest" DROP COLUMN "reason",
ADD COLUMN     "applyreason" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rejectreason" TEXT NOT NULL DEFAULT '';
