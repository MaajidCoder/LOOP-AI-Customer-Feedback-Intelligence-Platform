import { PrismaClient, Role, FeedbackCategory, FeedbackStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const FEEDBACK_SAMPLES = [
  {
    title: "App crashed on photo upload",
    description: "Every time I try to update my avatar, the application crashes on my phone. Please fix this bug ASAP!",
    category: FeedbackCategory.BUG,
    rating: 1,
    status: FeedbackStatus.NEW,
  },
  {
    title: "Request for Dark Mode",
    description: "I love the application, but it's very bright at night. Can you guys please implement dark mode? That would be amazing.",
    category: FeedbackCategory.FEATURE,
    rating: 4,
    status: FeedbackStatus.NEW,
  },
  {
    title: "Billing page keeps timing out",
    description: "Billing page keeps timing out when I try to download my monthly invoice. I've tried multiple browsers and it still fails.",
    category: FeedbackCategory.BUG,
    rating: 2,
    status: FeedbackStatus.REVIEW,
  },
  {
    title: "Beautiful dashboard UI!",
    description: "The new analytics dashboard is gorgeous and finally fast! Huge improvement over the older layout.",
    category: FeedbackCategory.IMPROVEMENT,
    rating: 5,
    status: FeedbackStatus.RESOLVED,
  },
  {
    title: "SSO Integration required for Enterprise",
    description: "We are evaluating your tool but our IT security policies mandate SAML SSO. We need this before we can purchase.",
    category: FeedbackCategory.FEATURE,
    rating: 3,
    status: FeedbackStatus.REVIEW,
  },
  {
    title: "Slow load times during peaks",
    description: "The platform gets noticeably slow between 9 AM and 11 AM EST. Pages take up to 8 seconds to load.",
    category: FeedbackCategory.BUG,
    rating: 2,
    status: FeedbackStatus.NEW,
  },
  {
    title: "Export reports to PDF/CSV is great",
    description: "Love the new exports capability, saved me about 2 hours of copy-pasting this week alone! High quality feature.",
    category: FeedbackCategory.FEATURE,
    rating: 5,
    status: FeedbackStatus.RESOLVED,
  },
  {
    title: "Confusing onboarding flow",
    description: "Onboarding took forever — I couldn't figure out how to invite my team members during setup. The button was hidden.",
    category: FeedbackCategory.IMPROVEMENT,
    rating: 3,
    status: FeedbackStatus.NEW,
  },
  {
    title: "Notification settings are broken",
    description: "Even when I disable email digests, I still receive them every Monday. Please verify your notification preferences saving.",
    category: FeedbackCategory.BUG,
    rating: 2,
    status: FeedbackStatus.NEW,
  },
  {
    title: "Simple and intuitive product",
    description: "Exactly what we were looking for. Very straightforward feedback management. Keeps our product team in line.",
    category: FeedbackCategory.OTHER,
    rating: 5,
    status: FeedbackStatus.ARCHIVED,
  },
];

const COMPANYS = ["Acme Corp", "TechCorp", "LogiTech", "Stark Industries", "Wayne Enterprises", "Globex", "Initech", "Umbrella Corp"];
const PRODUCT_AREAS = ["dashboard", "authentication", "billing", "settings", "integrations", "mobile app", "API", "onboarding"];

async function main() {
  const workspaceId = "default-workspace";

  // 1. Upsert Default Workspace
  console.log("Upserting workspace...");
  const workspace = await prisma.workspace.upsert({
    where: { id: workspaceId },
    update: {},
    create: {
      id: workspaceId,
      name: "Default Workspace",
      slug: "default-workspace",
    },
  });

  // 2. Clear Existing Data in Default Workspace for Clean Seeding
  console.log("Cleaning up old database records in default workspace...");
  await prisma.report.deleteMany({ where: { workspaceId } });
  await prisma.theme.deleteMany({ where: { workspaceId } });
  await prisma.feedback.deleteMany({ where: { workspaceId } });
  await prisma.user.deleteMany({ where: { workspaceId } });

  // 3. Create Seed Users
  console.log("Creating seed users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@company.com",
      password: passwordHash,
      role: Role.ADMIN,
      workspaceId,
    },
  });

  await prisma.user.create({
    data: {
      name: "Analyst User",
      email: "analyst@company.com",
      password: passwordHash,
      role: Role.ANALYST,
      workspaceId,
    },
  });

  await prisma.user.create({
    data: {
      name: "Viewer User",
      email: "viewer@company.com",
      password: passwordHash,
      role: Role.VIEWER,
      workspaceId,
    },
  });

  // 4. Create Workspace Themes
  console.log("Creating workspace themes...");
  const themes = [];
  const themeNames = [
    "Performance & Speed",
    "Authentication & Security",
    "Billing & Payments",
    "User Interface & Design",
    "User Onboarding",
  ];
  const themeColors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  for (let idx = 0; idx < themeNames.length; idx++) {
    const t = await prisma.theme.create({
      data: {
        name: themeNames[idx],
        workspaceId,
        color: themeColors[idx],
        description: `Feedback items clustered under the theme of ${themeNames[idx].toLowerCase()}.`,
      },
    });
    themes.push(t);
  }

  // 5. Generate 125 Ingested Feedback Entries
  console.log("Generating 125 realistic feedback items with AI metadata & mock embeddings...");
  const now = new Date();

  for (let i = 0; i < 125; i++) {
    const sample = FEEDBACK_SAMPLES[i % FEEDBACK_SAMPLES.length];
    const company = COMPANYS[i % COMPANYS.length];
    const area = PRODUCT_AREAS[i % PRODUCT_AREAS.length];

    const title = `${company}: ${sample.title} (${area})`;
    const description = `${sample.description} This occurred in our ${company} workspace specifically on the ${area} module.`;

    const createdAt = new Date();
    createdAt.setDate(now.getDate() - (i % 7));
    createdAt.setHours(i % 24, (i * 13) % 60, (i * 17) % 60);

    const score = sample.rating >= 4 ? 0.75 : sample.rating <= 2 ? -0.75 : 0.0;
    const sentiment = sample.rating >= 4 ? "POS" : sample.rating <= 2 ? "NEG" : "NEU";

    // Insert Feedback
    const feedback = await prisma.feedback.create({
      data: {
        title,
        description,
        rating: sample.rating,
        category: sample.category,
        status: sample.status,
        workspaceId,
        userId: admin.id,
        sentiment,
        sentimentScore: score,
        featureArea: area.toLowerCase(),
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Link to Theme deterministically
    const themeIndex = i % themes.length;
    await prisma.feedbackTheme.create({
      data: {
        feedbackId: feedback.id,
        themeId: themes[themeIndex].id,
        confidence: 1.0,
      },
    });

    // Generate Mock Text Embedding Vector (normalized 1536-dimensional array)
    const vec = new Array(1536).fill(0);
    for (let k = 0; k < description.length; k++) {
      const code = description.charCodeAt(k);
      vec[(k * 31) % 1536] += Math.sin(code + k);
    }
    const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    const normalizedVec = mag > 0 ? vec.map((v) => v / mag) : vec;

    await prisma.embedding.create({
      data: {
        feedbackId: feedback.id,
        vector: JSON.stringify(normalizedVec),
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("Workspace: Default Workspace (default-workspace)");
  console.log("Demo Credentials:");
  console.log(" - Admin: admin@company.com / password123");
  console.log(" - Analyst: analyst@company.com / password123");
  console.log(" - Viewer: viewer@company.com / password123");
  console.log("Generated: 125 Feedback entries, 5 Themes, 125 Embeddings.");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
