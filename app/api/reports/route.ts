import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVoiceOfCustomerReport } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;

    const reports = await prisma.report.findMany({
      where: {
        workspaceId,
      },
      include: {
        generatedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "VIEWER";
    if (userRole === "VIEWER") {
      return NextResponse.json({ error: "Forbidden: Viewers cannot generate reports" }, { status: 403 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const userId = (session.user as any).id;

    // Calculate dates (past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const now = new Date();

    // 1. Gather stats
    const totalCount = await prisma.feedback.count({
      where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
    });

    if (totalCount === 0) {
      return NextResponse.json(
        { error: "Insufficient data: You must have at least 1 feedback item ingested in the last 7 days to generate a report." },
        { status: 400 }
      );
    }

    const ratingAggregate = await prisma.feedback.aggregate({
      where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
      _avg: { rating: true },
    });
    const avgRating = parseFloat((ratingAggregate._avg.rating || 0).toFixed(1));

    const negativeCount = await prisma.feedback.count({
      where: { workspaceId, rating: { lte: 2 }, createdAt: { gte: sevenDaysAgo } },
    });

    // Categories breakdown
    const feedbacks = await prisma.feedback.findMany({
      where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
      select: { category: true, description: true },
    });

    const categoryMap: Record<string, number> = {};
    feedbacks.forEach((f) => {
      categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
    });

    const categories = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Verbatim quotes
    const recentQuotes = feedbacks
      .map((f) => f.description)
      .filter((desc) => desc.length > 10 && desc.length < 200)
      .slice(0, 5);

    const periodString = `${sevenDaysAgo.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    // 2. Generate AI VoC
    const aiReport = await generateVoiceOfCustomerReport({
      period: periodString,
      totalCount,
      avgRating,
      negativeCount,
      categories,
      recentQuotes,
    });

    // 3. Save report
    const report = await prisma.report.create({
      data: {
        title: `Voice of Customer Report (${periodString})`,
        periodStart: sevenDaysAgo,
        periodEnd: now,
        contentJson: JSON.stringify(aiReport),
        workspaceId,
        generatedById: userId,
      },
      include: {
        generatedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
