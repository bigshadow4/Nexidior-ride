/*
  Warnings:

  - Added the required column `cumulativeDelay` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialDepartureTime` to the `Ride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "cumulativeDelay" INTEGER NOT NULL,
ADD COLUMN     "initialDepartureTime" TIMESTAMP(3) NOT NULL;
