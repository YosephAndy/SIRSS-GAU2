/*
  Warnings:

  - You are about to drop the column `zoneId` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `zoneId` on the `Incident` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `zoneId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Waypoint` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Waypoint` table. All the data in the column will be lost.
  - You are about to drop the column `routeId` on the `Waypoint` table. All the data in the column will be lost.
  - You are about to drop the column `geometry` on the `Zone` table. All the data in the column will be lost.
  - You are about to drop the `AssignedRoute` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shift` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routeId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationPoint` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasCampanio` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originPoint` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalId` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleId` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Zone` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MANANA', 'TARDE', 'NOCHE', 'DOMINGO');

-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('NORMAL', 'REPECHAJE', 'FURGON', 'TURNO_DOMINICAL', 'TURNO_NOCHE');

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "AssignedRoute" DROP CONSTRAINT "AssignedRoute_driverId_fkey";

-- DropForeignKey
ALTER TABLE "AssignedRoute" DROP CONSTRAINT "AssignedRoute_routeId_fkey";

-- DropForeignKey
ALTER TABLE "Incident" DROP CONSTRAINT "Incident_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "Waypoint" DROP CONSTRAINT "Waypoint_routeId_fkey";

-- DropIndex
DROP INDEX "Schedule_zoneId_day_key";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "zoneId",
ADD COLUMN     "zona" TEXT;

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "images" JSONB;

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "zoneId",
ADD COLUMN     "zona" TEXT;

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "description",
DROP COLUMN "isActive",
DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "shift" "Shift" NOT NULL,
ADD COLUMN     "type" "RouteType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "zoneId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "day",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "zoneId",
ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "days" "Day"[],
ADD COLUMN     "departureTime" TEXT,
ADD COLUMN     "routeId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zoneName" TEXT;

-- AlterTable
ALTER TABLE "Waypoint" DROP COLUMN "address",
DROP COLUMN "order",
DROP COLUMN "routeId",
ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "departureTime" TEXT,
ADD COLUMN     "destinationPoint" TEXT NOT NULL,
ADD COLUMN     "hasCampanio" BOOLEAN NOT NULL,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "originPoint" TEXT NOT NULL,
ADD COLUMN     "originalId" INTEGER NOT NULL,
ADD COLUMN     "scheduleId" INTEGER NOT NULL,
ADD COLUMN     "sequence" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "lat" DROP NOT NULL,
ALTER COLUMN "lng" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Zone" DROP COLUMN "geometry",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "AssignedRoute";

-- DropEnum
DROP TYPE "RouteStatus";

-- CreateIndex
CREATE INDEX "Route_zoneId_idx" ON "Route"("zoneId");

-- CreateIndex
CREATE INDEX "Route_shift_idx" ON "Route"("shift");

-- CreateIndex
CREATE INDEX "Route_type_idx" ON "Route"("type");

-- CreateIndex
CREATE INDEX "Schedule_routeId_idx" ON "Schedule"("routeId");

-- CreateIndex
CREATE INDEX "Waypoint_scheduleId_idx" ON "Waypoint"("scheduleId");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waypoint" ADD CONSTRAINT "Waypoint_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
