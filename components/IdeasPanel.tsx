"use client";

import { useState } from "react";
import type { Idea, Client } from "@/types";

interface IdeasPanelProps {
  ideas: Idea[];
  clients: Client[];
  selectedClientId: string | null;
}

type Tab = "all" | "cliente";

export default function IdeasPanel({ ideas, clients, selectedClientId }: IdeasPanelProps) {
  const [tab, setTab] = useState<Tab>("all");

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const filtered = tab === "cliente" && selectedClientId
    ? ideas.filter((i) => i.clienteId === selectedClientId)
    : ideas;

  return (
    <section className="px-5 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-lg font-semibold text-gray-800">Ideas</h2>
        <span className="text-xs text-gray-400 font-sans">{filtered.length} ideas</span>
      </div>

      {/* Tabs */}
      {selectedClientId && (
        <div className="flex gap-2 mb-3">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            Todas
          </TabButton>
          <TabButton active={tab === "cliente"} onClick={() => setTab("cliente")}>
            {selectedClient?.nombre ?? "Cliente"}
          </TabButton>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-400 text-sm font-sans">Sin ideas aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((idea) => (
            <IdeaRow key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-semibold font-sans transition-colors ${
        active
          ? "bg-gray-900 text-white"
          : "bg-cream-dark text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Inbox: "bg-gray-100 text-gray-500",
  "En progreso": "bg-blue-100 text-blue-600",
  Hecho: "bg-green-100 text-green-600",
  Archivado: "bg-gray-50 text-gray-400",
};

function IdeaRow({ idea }: { idea: Idea }) {
  const statusCls = STATUS_COLORS[idea.status] ?? "bg-gray-100 text-gray-500";

  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <span className="text-base">💡</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 font-sans truncate">
          {idea.nombre}
        </p>
        {idea.clienteRelacionado && (
          <p className="text-xs text-gray-400 font-sans mt-0.5 truncate">
            {idea.clienteRelacionado}
          </p>
        )}
      </div>
      <span className={`badge ${statusCls} shrink-0`}>{idea.status}</span>
    </div>
  );
}
