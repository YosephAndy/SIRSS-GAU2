import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations/announcement";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    const announcements = await prisma.announcement.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = announcementSchema.parse(body);

    const announcement = await prisma.announcement.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        priority: validatedData.priority || "NORMAL",
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        isActive: validatedData.isActive ?? true,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error);
    if (error instanceof Error && error.name === "ZodError") {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
