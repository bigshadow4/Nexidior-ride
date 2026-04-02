/*
  Warnings:

  - Added the required column `checkInMinutes` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terminal` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "checkInMinutes" INTEGER NOT NULL,
ADD COLUMN     "flightTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "terminal" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;
