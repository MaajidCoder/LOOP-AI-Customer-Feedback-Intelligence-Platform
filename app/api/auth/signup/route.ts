import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  workspace: z.string().min(1, "Workspace name is required."),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional().default("ADMIN"),
});

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    const raw = await request.text();
    console.log("raw signup body:", raw);

    try {
      body = JSON.parse(raw);
    } catch (parseErr) {
      // Fallback: try to normalize non-strict object literal like {name:Test User,email:...}
      try {
        const stripped = raw.replace(/^"(.*)"$/, "$1");
        const quotedKeys = stripped.replace(
          /([{,]\s*)([A-Za-z0-9_]+)\s*:/g,
          '$1"$2":',
        );
        const normalized = quotedKeys.replace(
          /:\s*([^\{\},\n]+)(?=(,|}))/g,
          (_m, p1) => {
            const v = p1.trim();
            if (
              /^\".*\"$/.test(v) ||
              /^(true|false|null|-?\d+(?:\.\d+)?)$/.test(v)
            )
              return ":" + v;
            return ':"' + v.replace(/\"/g, '\\"') + '"';
          },
        );

        console.log("normalized signup body:", normalized);
        body = JSON.parse(normalized);
      } catch (normErr) {
        console.error("Failed to normalize signup payload", normErr);
        throw parseErr;
      }
    }
  } catch (err) {
    console.error("Invalid JSON payload for signup", err);
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  console.log("signup body received", body);
  const parseResult = signupSchema.safeParse(body);

  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues
      .map((issue) => issue.message)
      .join(" ");

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { name, email, password, workspace, role } = parseResult.data;
  const workspaceSlug = createSlug(workspace);

  if (!workspaceSlug) {
    return NextResponse.json(
      { error: "Workspace name must contain letters or numbers." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "This email is already registered." },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        workspace: {
          create: {
            name: workspace,
            slug: workspaceSlug,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target as string[] | undefined;
      if (target?.includes("email")) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 409 },
        );
      }
      if (target?.includes("slug")) {
        return NextResponse.json(
          { error: "This workspace name is already taken." },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 },
    );
  }
}
