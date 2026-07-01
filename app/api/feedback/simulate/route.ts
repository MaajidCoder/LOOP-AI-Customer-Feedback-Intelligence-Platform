import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const SIMULATED_POOL = [
  {
    title: "App crashes on photo upload",
    description: "Every time I try to update my avatar, the application crashes on my phone. Please fix this bug ASAP!",
    rating: 1,
    category: "BUG" as const,
    status: "NEW" as const,
  },
  {
    title: "Request for Dark Mode",
    description: "I love the application, but it's very bright at night. Can you guys please implement dark mode? That would be amazing.",
    rating: 4,
    category: "FEATURE" as const,
    status: "NEW" as const,
  },
  {
    title: "Billing page keeps timing out",
    description: "Billing page keeps timing out when I try to download my monthly invoice. I've tried multiple browsers and it still fails.",
    rating: 2,
    category: "BUG" as const,
    status: "REVIEW" as const,
  },
  {
    title: "Beautiful dashboard UI!",
    description: "The new analytics dashboard is gorgeous and finally fast! Huge improvement over the older layout.",
    rating: 5,
    category: "IMPROVEMENT" as const,
    status: "NEW" as const,
  },
  {
    title: "SSO Integration required for Enterprise",
    description: "We are evaluating your tool but our IT security policies mandate SAML SSO. We need this before we can purchase.",
    rating: 3,
    category: "FEATURE" as const,
    status: "REVIEW" as const,
  },
  {
    title: "Slow load times during peaks",
    description: "The platform gets noticeably slow between 9 AM and 11 AM EST. Pages take up to 8 seconds to load.",
    rating: 2,
    category: "BUG" as const,
    status: "NEW" as const,
  },
  {
    title: "Export reports to PDF/CSV is great",
    description: "Love the new exports capability, saved me about 2 hours of copy-pasting this week alone! High quality feature.",
    rating: 5,
    category: "FEATURE" as const,
    status: "NEW" as const,
  },
  {
    title: "Confusing onboarding flow",
    description: "Onboarding took forever — I couldn't figure out how to invite my team members during setup. The button was hidden.",
    rating: 3,
    category: "IMPROVEMENT" as const,
    status: "NEW" as const,
  },
  {
    title: "Notification settings are broken",
    description: "Even when I disable email digests, I still receive them every Monday. Please verify your notification preferences saving.",
    rating: 2,
    category: "BUG" as const,
    status: "NEW" as const,
  },
  {
    title: "Simple and intuitive",
    description: "Exactly what we were looking for. Very straightforward feedback management. Keeps our product team in line.",
    rating: 5,
    category: "OTHER" as const,
    status: "NEW" as const,
  },
];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole === "VIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Viewer accounts are read-only" },
        { status: 403 },
      );
    }

    // Insert 5 random items from the pool
    const selectedItems = [...SIMULATED_POOL]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((item) => ({
        ...item,
        workspaceId,
        userId,
      }));

    await prisma.feedback.createMany({
      data: selectedItems,
    });

    return NextResponse.json({
      success: true,
      count: selectedItems.length,
      message: `Successfully imported ${selectedItems.length} simulated feed items.`,
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Failed to simulate channel feed" },
      { status: 500 },
    );
  }
}
