import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const updateFeedbackSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  rating: z.number().min(1).max(5).optional(),
  category: z.enum(["BUG", "FEATURE", "IMPROVEMENT", "OTHER"]).optional(),
  status: z.enum(["NEW", "REVIEW", "RESOLVED", "ARCHIVED"]).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const { id } = await params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!feedback || feedback.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("GET /api/feedback/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const userRole = (session.user as any).role;

    if (userRole === "VIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Viewer accounts are read-only" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const existing = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!existing || existing.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validation = updateFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: validation.data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("PUT /api/feedback/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const userRole = (session.user as any).role;

    if (userRole === "VIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Viewer accounts are read-only" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const existing = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!existing || existing.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/feedback/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 },
    );
  }
}
