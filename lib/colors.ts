import type { WorkloadLevel, ClientStatus } from "@/types";

export const CLIENT_COLORS: Record<string, string> = {
  CEDIR: "#D4E8F7",
  SEMO: "#D4F0E0",
  SIPEC: "#E8D4F7",
  SALAS: "#FFD4D4",
  Juntos: "#FFF3CC",
  "Brazos Abiertos": "#FFE5CC",
  "Manera Pérez": "#D4F0E0",
};

export function getClientColor(nombre: string): string {
  if (CLIENT_COLORS[nombre]) return CLIENT_COLORS[nombre];
  // Deterministic fallback based on first char
  const palette = ["#D4E8F7", "#D4F0E0", "#E8D4F7", "#FFD4D4", "#FFF3CC", "#FFE5CC"];
  return palette[nombre.charCodeAt(0) % palette.length];
}

export const WORKLOAD_BADGE: Record<WorkloadLevel, { bg: string; text: string; label: string }> = {
  Baja: { bg: "bg-green-100", text: "text-green-700", label: "Baja" },
  Media: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Media" },
  Alta: { bg: "bg-orange-100", text: "text-orange-700", label: "Alta" },
  "Muy alta": { bg: "bg-red-100", text: "text-red-700", label: "Muy alta" },
};

export const STATUS_BADGE: Record<ClientStatus, { bg: string; text: string }> = {
  Activo: { bg: "bg-green-100", text: "text-green-700" },
  "En prueba": { bg: "bg-blue-100", text: "text-blue-700" },
  "En pausa": { bg: "bg-gray-100", text: "text-gray-600" },
  Potencial: { bg: "bg-purple-100", text: "text-purple-700" },
};
