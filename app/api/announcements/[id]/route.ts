import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations/announcement";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
    });

    if (!announcement) {
      return new NextResponse("Announcement not found", { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("[ANNOUNCEMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = announcementSchema.partial().parse(body);

    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        priority: validatedData.priority,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("[ANNOUNCEMENT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcement = await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("[ANNOUNCEMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
