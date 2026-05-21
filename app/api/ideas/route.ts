import { NextResponse } from "next/server";
import { fetchIdeas } from "@/lib/notion";

export const revalidate = 60;

export async function GET() {
  try {
    const ideas = await fetchIdeas();
    return NextResponse.json({ ideas, source: "notion" });
  } catch (error) {
    console.error("[/api/ideas] Notion error:", error);
    return NextResponse.json(
      { ideas: [], source: "fallback" },
      { status: 200 }
    );
  }
}
