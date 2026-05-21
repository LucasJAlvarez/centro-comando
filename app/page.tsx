"use client";

import { useEffect, useState, useCallback } from "react";
import type { Client, Idea } from "@/types";
import Header from "@/components/Header";
import AlertsSurface from "@/components/AlertsSurface";
import ClientCard from "@/components/ClientCard";
import IdeasPanel from "@/components/IdeasPanel";
import VoiceCommand from "@/components/VoiceCommand";

type NotionStatus = "checking" | "online" | "offline";
type ClientFilter = "Todos" | "Activos" | "En prueba";

const FILTERS: ClientFilter[] = ["Todos", "Activos", "En prueba"];

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [notionStatus, setNotionStatus] = useState<NotionStatus>("checking");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ClientFilter>("Todos");

  const fetchData = useCallback(async () => {
    try {
      const [cRes, iRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/ideas"),
      ]);

      const cData = await cRes.json();
      const iData = await iRes.json();

      setClients(cData.clients ?? []);
      setIdeas(iData.ideas ?? []);
      setNotionStatus(cData.source === "notion" ? "online" : "offline");
    } catch {
      setNotionStatus("offline");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredClients = clients.filter((c) => {
    if (filter === "Activos") return c.estado === "Activo";
    if (filter === "En prueba") return c.estado === "En prueba";
    return true;
  });

  const handleSelectClient = useCallback((id: string) => {
    setSelectedClientId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <main className="pb-24">
      <Header notionStatus={notionStatus} />

      {/* Alerts */}
      {clients.length > 0 && (
        <AlertsSurface clients={clients} ideas={ideas} />
      )}

      {/* Client list section */}
      <section className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-semibold text-gray-800">
            Clientes
          </h2>
          {/* Fee total */}
          <span className="text-xs text-gray-400 font-sans">
            {formatTotal(clients)}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold font-sans transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-cream-dark text-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards */}
        {clients.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-gray-400 text-sm font-sans">Cargando clientes…</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                isSelected={selectedClientId === client.id}
                onSelect={handleSelectClient}
              />
            ))}
            {filteredClients.length === 0 && (
              <div className="card p-6 text-center">
                <p className="text-gray-400 text-sm font-sans">
                  Sin clientes en esta categoría
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Ideas panel */}
      <IdeasPanel
        ideas={ideas}
        clients={clients}
        selectedClientId={selectedClientId}
      />

      {/* Voice FAB */}
      <VoiceCommand clients={clients} onSaved={fetchData} />
    </main>
  );
}

function formatTotal(clients: Client[]): string {
  const active = clients.filter((c) => c.estado === "Activo" || c.estado === "En prueba");
  const total = active.reduce((s, c) => s + c.feeMensual, 0);
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M / mes`;
  if (total >= 1_000) return `$${(total / 1_000).toFixed(0)}k / mes`;
  return `$${total} / mes`;
}
