import { NextResponse } from "next/server";
import { fetchClients } from "@/lib/notion";
import { FALLBACK_CLIENTS } from "@/lib/fallback-data";

export const revalidate = 60; // ISR: revalidate every 60s

export async function GET() {
  try {
    const clients = await fetchClients();
    return NextResponse.json({ clients, source: "notion" });
  } catch (error) {
    console.error("[/api/clients] Notion error, using fallback:", error);
    return NextResponse.json(
      { clients: FALLBACK_CLIENTS, source: "fallback" },
      { status: 200 }
    );
  }
}
