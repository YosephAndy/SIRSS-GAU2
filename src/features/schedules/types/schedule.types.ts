export type ScheduleWithZone = {
  id: number
  zoneId: number
  day: string
  startTime: string
  endTime: string
  createdAt: string
  zone: {
    id: number
    name: string
  }
}
