/*
  Warnings:

  - You are about to drop the column `checkInMinutes` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `flightTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `terminal` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `startLocationName` to the `Ride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "checkInMinutes",
DROP COLUMN "flightTime",
DROP COLUMN "terminal";

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "endLocationName" TEXT NOT NULL DEFAULT 'Aéroport',
ADD COLUMN     "startLocationName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "checkInMinutes" INTEGER,
ADD COLUMN     "flightTime" TIMESTAMP(3),
ADD COLUMN     "terminal" TEXT;

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);
