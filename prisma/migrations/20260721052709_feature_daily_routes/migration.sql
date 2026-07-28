-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'FINISHED');

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Waypoint" ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DailyRoute" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "driverId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "RouteStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyRoute_scheduleId_driverId_date_key" ON "DailyRoute"("scheduleId", "driverId", "date");

-- AddForeignKey
ALTER TABLE "DailyRoute" ADD CONSTRAINT "DailyRoute_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRoute" ADD CONSTRAINT "DailyRoute_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
