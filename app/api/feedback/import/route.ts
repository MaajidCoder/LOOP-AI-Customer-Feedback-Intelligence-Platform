import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { processFeedbackAI } from "@/lib/ai";

const rowSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  rating: z.number().min(1).max(5).default(3),
  category: z.enum(["BUG", "FEATURE", "IMPROVEMENT", "OTHER"]).default("OTHER"),
  status: z.enum(["NEW", "REVIEW", "RESOLVED", "ARCHIVED"]).default("NEW"),
});

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped double quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function preprocessCSVLine(line: string): string {
  const trimmed = line.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    const parsed = parseCSVLine(trimmed);
    if (parsed.length === 1) {
      return trimmed.slice(1, -1);
    }
  }
  return line;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return [];

  const cleanedLines = lines.map(preprocessCSVLine);

  const headers = parseCSVLine(cleanedLines[0]).map((h) => h.trim().toLowerCase());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < cleanedLines.length; i++) {
    const values = parseCSVLine(cleanedLines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index].trim() : "";
    });
    results.push(row);
  }
  return results;
}


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

    const rawBody = await request.text();
    console.log("[CSV Import] Raw body length:", rawBody.length);
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { csvText } = parsedBody;

    if (!csvText) {
      return NextResponse.json(
        { error: "CSV data is required" },
        { status: 400 },
      );
    }

    const parsedRows = parseCSV(csvText);
    if (parsedRows.length === 0) {
      return NextResponse.json(
        { error: "No records found in CSV" },
        { status: 400 },
      );
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    const feedbackDataToInsert = [];

    // Diagnostic log to catch any CSV parsing issues
    if (parsedRows.length > 0) {
      console.log("[CSV Import] First parsed row keys:", Object.keys(parsedRows[0]));
      console.log("[CSV Import] First parsed row values:", parsedRows[0]);
    }

    for (let idx = 0; idx < parsedRows.length; idx++) {
      const row = parsedRows[idx];
      
      // Clean and map keys
      const cleanRow: any = {
        title: (row.title || row.content?.substring(0, 40) || `Feedback #${idx + 1}`).trim(),
        description: (row.description || row.content || row.title || `See title: ${row.title || ''}`).trim(),
        // Robustly parse rating: extract leading numeric part to handle trailing text/whitespace
        rating: row.rating ? (parseInt(row.rating.toString().trim().match(/^\d+/)?.[0] || "3", 10) || 3) : 3,
        category: ((row.category || row.type || "OTHER").trim()).toUpperCase(),
        status: ((row.status || "NEW").trim()).toUpperCase(),
      };

      console.log(`[CSV Import] Row ${idx + 1} cleanRow:`, cleanRow);

      // Zod validation
      const validation = rowSchema.safeParse(cleanRow);
      if (!validation.success) {
        failCount++;
        errors.push(`Row ${idx + 1}: ${validation.error.issues[0].message}`);
        continue;
      }

      feedbackDataToInsert.push({
        ...validation.data,
        workspaceId,
        userId,
      });
      successCount++;
    }

    if (feedbackDataToInsert.length > 0) {
      for (const item of feedbackDataToInsert) {
        const created = await prisma.feedback.create({
          data: item,
        });
        // Run AI classification & embeddings in the background
        processFeedbackAI(created.id, created.description, workspaceId);
      }
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      failed: failCount,
      errors,
    });
  } catch (error) {
    console.error("CSV Import error:", error);
    return NextResponse.json(
      { error: "Failed to import CSV" },
      { status: 500 },
    );
  }
}
