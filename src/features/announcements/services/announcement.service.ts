import { prisma } from '@/lib/prisma'
import { Priority } from '@/generated/prisma/enums'

export async function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function updateAnnouncement(id: number, data: {
  title: string
  content: string
  priority: Priority
  isActive: boolean
}) {
  return prisma.announcement.update({
    where: { id },
    data,
  })
}
