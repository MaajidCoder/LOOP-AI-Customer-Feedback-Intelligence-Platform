import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { processFeedbackAI } from "@/lib/ai";

const feedbackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  rating: z.number().min(1).max(5).default(3),
  category: z.enum(["BUG", "FEATURE", "IMPROVEMENT", "OTHER"]).default("OTHER"),
  status: z.enum(["NEW", "REVIEW", "RESOLVED", "ARCHIVED"]).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    const where: any = {
      workspaceId,
      ...(status && { status }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({
      data: feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole === "VIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Viewer accounts are read-only" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validation = feedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        ...validation.data,
        workspaceId,
        ...(userId && { userId }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Trigger AI classification & embeddings in the background
    processFeedbackAI(feedback.id, feedback.description, workspaceId);

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
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

    await prisma.feedback.deleteMany({
      where: {
        workspaceId,
      },
    });

    return NextResponse.json({ success: true, message: "All feedback cleared successfully" });
  } catch (error) {
    console.error("DELETE /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to clear feedback" },
      { status: 500 },
    );
  }
}

