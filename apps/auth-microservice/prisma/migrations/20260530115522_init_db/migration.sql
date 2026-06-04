/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('EMPLOYEE', 'MANAGER');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "employee" (
    "employeeId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "EmployeeRole" NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("employeeId")
);
