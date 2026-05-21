"use client";

import type { Client } from "@/types";
import { getClientColor, WORKLOAD_BADGE, STATUS_BADGE } from "@/lib/colors";

interface ClientCardProps {
  client: Client;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function formatFee(fee: number): string {
  if (fee >= 1_000_000) return `$${(fee / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (fee >= 1_000) return `$${(fee / 1_000).toFixed(0)}k`;
  return `$${fee}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ClientCard({ client, isSelected, onSelect }: ClientCardProps) {
  const bg = getClientColor(client.nombre);
  const workload = WORKLOAD_BADGE[client.nivelCarga] ?? WORKLOAD_BADGE["Media"];
  const status = STATUS_BADGE[client.estado] ?? STATUS_BADGE["Activo"];

  return (
    <button
      onClick={() => onSelect(client.id)}
      className={`w-full text-left transition-all duration-150 ${
        isSelected
          ? "ring-2 ring-gray-900 ring-offset-2 ring-offset-cream"
          : "active:scale-95"
      }`}
      style={{ borderRadius: "1rem" }}
    >
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ backgroundColor: bg }}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-gray-700"
          style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
        >
          {getInitials(client.nombre)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif font-semibold text-gray-800 truncate text-base leading-tight">
              {client.nombre}
            </h3>
            <span className="font-sans font-bold text-gray-700 text-sm shrink-0">
              {formatFee(client.feeMensual)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Carga */}
            <span
              className={`badge ${workload.bg} ${workload.text}`}
            >
              {workload.label}
            </span>

            {/* Estado */}
            <span className={`badge ${status.bg} ${status.text}`}>
              {client.estado}
            </span>
          </div>

          {/* Próxima acción */}
          {client.proximaAccion && (
            <p className="text-xs text-gray-600 mt-1.5 font-sans leading-snug truncate">
              → {client.proximaAccion}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
