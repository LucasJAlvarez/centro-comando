import { NextRequest, NextResponse } from "next/server";
import { saveNote } from "@/lib/notion";
import type { SaveNotePayload, NoteType } from "@/types";

const VALID_TYPES: NoteType[] = ["Idea", "Reunión", "Referencia", "Briefing", "Otro"];

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const { nombre, tipo, clienteId } = body as Record<string, unknown>;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return NextResponse.json({ error: "nombre is required" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(tipo as NoteType)) {
    return NextResponse.json(
      { error: `tipo must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const payload: SaveNotePayload = {
    nombre: nombre.trim(),
    tipo: tipo as NoteType,
    clienteId: typeof clienteId === "string" ? clienteId : null,
  };

  try {
    const id = await saveNote(payload);
    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("[/api/save] Notion error:", error);
    return NextResponse.json(
      { error: "Failed to save to Notion" },
      { status: 502 }
    );
  }
}
