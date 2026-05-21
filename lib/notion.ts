import { Client as NotionClient } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
  CreatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import type { Client, Idea, NoteType, NoteStatus, SaveNotePayload } from "@/types";

const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });

const CLIENTS_DB = process.env.NOTION_CLIENTS_DB ?? "2636ca5f-fc54-81d0-a951-000ba7534a82";
const IDEAS_DB = process.env.NOTION_IDEAS_DB ?? "2636ca5f-fc54-8115-9391-000b4751f9bb";

// ─── property helpers ────────────────────────────────────────────────────────

type Props = PageObjectResponse["properties"];

function getText(props: Props, key: string): string {
  const p = props[key];
  if (!p) return "";
  if (p.type === "title") return p.title.map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
  return "";
}

function getSelect(props: Props, key: string): string {
  const p = props[key];
  if (p?.type === "select") return p.select?.name ?? "";
  return "";
}

function getNumber(props: Props, key: string): number {
  const p = props[key];
  if (p?.type === "number") return p.number ?? 0;
  return 0;
}

function getRelationName(props: Props, key: string): { id: string; name: string } | null {
  const p = props[key];
  if (p?.type === "relation" && p.relation.length > 0) {
    return { id: p.relation[0].id, name: "" };
  }
  return null;
}

// ─── public functions ─────────────────────────────────────────────────────────

export async function fetchClients(): Promise<Client[]> {
  const res: QueryDatabaseResponse = await notion.databases.query({
    database_id: CLIENTS_DB,
    filter: {
      or: [
        { property: "Estado del cliente", select: { equals: "Activo" } },
        { property: "Estado del cliente", select: { equals: "En prueba" } },
        { property: "Estado del cliente", select: { equals: "En pausa" } },
        { property: "Estado del cliente", select: { equals: "Potencial" } },
      ],
    },
    sorts: [{ property: "Fee mensual", direction: "descending" }],
  });

  return res.results
    .filter((p): p is PageObjectResponse => p.object === "page" && "properties" in p)
    .map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        nombre: getText(p, "Nombre") || getText(p, "Name") || getText(p, "nombre"),
        feeMensual: getNumber(p, "Fee mensual"),
        nivelCarga: getSelect(p, "Nivel de carga") as Client["nivelCarga"],
        rentabilidad: getSelect(p, "Rentabilidad") as Client["rentabilidad"],
        estado: getSelect(p, "Estado del cliente") as Client["estado"],
        proximaAccion:
          getText(p, "Próxima acción") || getText(p, "Proxima accion"),
      };
    });
}

export async function fetchIdeas(): Promise<Idea[]> {
  const res: QueryDatabaseResponse = await notion.databases.query({
    database_id: IDEAS_DB,
    filter: {
      property: "Tipo",
      select: { equals: "Idea" },
    },
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });

  return res.results
    .filter((p): p is PageObjectResponse => p.object === "page" && "properties" in p)
    .map((page) => {
      const p = page.properties;
      const rel = getRelationName(p, "proyecto relacionado");
      return {
        id: page.id,
        nombre: getText(p, "Nombre") || getText(p, "Name") || getText(p, "nombre"),
        tipo: getSelect(p, "Tipo") as NoteType,
        status: getSelect(p, "Status") as NoteStatus,
        clienteRelacionado: rel ? rel.name : null,
        clienteId: rel ? rel.id : null,
      };
    });
}

export async function saveNote(payload: SaveNotePayload): Promise<string> {
  type NotionProps = CreatePageParameters["properties"];

  const properties: NotionProps = {
    Nombre: {
      title: [{ text: { content: payload.nombre } }],
    },
    Tipo: {
      select: { name: payload.tipo },
    },
    Status: {
      select: { name: "Inbox" },
    },
  };

  if (payload.clienteId) {
    (properties as Record<string, unknown>)["proyecto relacionado"] = {
      relation: [{ id: payload.clienteId }],
    };
  }

  const page = await notion.pages.create({
    parent: { database_id: IDEAS_DB },
    properties,
  });

  return page.id;
}
