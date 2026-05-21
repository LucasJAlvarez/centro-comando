export type WorkloadLevel = "Baja" | "Media" | "Alta" | "Muy alta";
export type Profitability = "Alta" | "Media" | "Baja";
export type ClientStatus = "Activo" | "En prueba" | "En pausa" | "Potencial";
export type NoteType = "Idea" | "Reunión" | "Referencia" | "Briefing" | "Otro";
export type NoteStatus = "Inbox" | "En progreso" | "Hecho" | "Archivado";

export interface Client {
  id: string;
  nombre: string;
  feeMensual: number;
  nivelCarga: WorkloadLevel;
  rentabilidad: Profitability;
  estado: ClientStatus;
  proximaAccion: string;
}

export interface Idea {
  id: string;
  nombre: string;
  tipo: NoteType;
  status: NoteStatus;
  clienteRelacionado: string | null;
  clienteId: string | null;
}

export interface SaveNotePayload {
  nombre: string;
  tipo: NoteType;
  clienteId: string | null;
}
