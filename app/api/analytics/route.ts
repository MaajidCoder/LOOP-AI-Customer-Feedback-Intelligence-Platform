import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;

    // Fetch all feedback in the workspace
    const feedbackList = await prisma.feedback.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });

    const totalCount = feedbackList.length;

    // Calculate Average Rating
    const avgRating =
      totalCount > 0
        ? parseFloat(
            (
              feedbackList.reduce((acc, curr) => acc + curr.rating, 0) /
              totalCount
            ).toFixed(1),
          )
        : 0;

    // Calculate Percent Negative (Rating 1 or 2)
    const negativeCount = feedbackList.filter((f) => f.rating <= 2).length;
    const percentNegative =
      totalCount > 0
        ? Math.round((negativeCount / totalCount) * 100)
        : 0;

    // Calculate Items Added This Week (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newThisWeek = feedbackList.filter(
      (f) => new Date(f.createdAt) >= sevenDaysAgo,
    ).length;

    // 1. Volume Over Time (last 7 days grouped by date)
    const volumeMap: Record<string, number> = {};
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      volumeMap[dateStr] = 0;
    }

    feedbackList.forEach((f) => {
      const dateStr = new Date(f.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (volumeMap[dateStr] !== undefined) {
        volumeMap[dateStr]++;
      }
    });

    const volumeOverTime = Object.entries(volumeMap).map(([date, count]) => ({
      date,
      count,
    }));

    // 2. Sentiment Breakdown
    const sentimentBreakdown = [
      {
        name: "Positive",
        value: feedbackList.filter((f) => f.rating >= 4).length,
      },
      {
        name: "Neutral",
        value: feedbackList.filter((f) => f.rating === 3).length,
      },
      {
        name: "Negative",
        value: negativeCount,
      },
    ];

    // 3. Category Breakdown
    const categoryMap: Record<string, number> = {
      BUG: 0,
      FEATURE: 0,
      IMPROVEMENT: 0,
      OTHER: 0,
    };
    feedbackList.forEach((f) => {
      if (categoryMap[f.category] !== undefined) {
        categoryMap[f.category]++;
      } else {
        categoryMap.OTHER++;
      }
    });

    const categoryBreakdown = Object.entries(categoryMap).map(
      ([name, value]) => ({
        name: name === "BUG" ? "Bugs" : name === "FEATURE" ? "Features" : name === "IMPROVEMENT" ? "Improvements" : "Other",
        value,
      }),
    );

    return NextResponse.json({
      totalCount,
      avgRating,
      percentNegative,
      newThisWeek,
      volumeOverTime,
      sentimentBreakdown,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
