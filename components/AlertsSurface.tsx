"use client";

import type { Client, Idea } from "@/types";

interface AlertsSurfaceProps {
  clients: Client[];
  ideas: Idea[];
}

interface Alert {
  id: string;
  icon: string;
  text: string;
  severity: "warn" | "info";
}

function buildAlerts(clients: Client[], ideas: Idea[]): Alert[] {
  const alerts: Alert[] = [];

  // Clientes en prueba sin próxima acción definida
  const trialNoAction = clients.filter(
    (c) => c.estado === "En prueba" && !c.proximaAccion.trim()
  );
  if (trialNoAction.length > 0) {
    const names = trialNoAction.map((c) => c.nombre).join(", ");
    alerts.push({
      id: "trial-no-action",
      icon: "⚠️",
      text: `${trialNoAction.length === 1 ? "Cliente" : "Clientes"} en prueba sin próxima acción: ${names}`,
      severity: "warn",
    });
  }

  // Clientes con carga Muy alta
  const overloaded = clients.filter((c) => c.nivelCarga === "Muy alta" && c.estado === "Activo");
  if (overloaded.length > 0) {
    const names = overloaded.map((c) => c.nombre).join(", ");
    alerts.push({
      id: "overloaded",
      icon: "🔥",
      text: `Carga muy alta: ${names}`,
      severity: "warn",
    });
  }

  // Ideas en Inbox sin procesar
  const inboxIdeas = ideas.filter((i) => i.status === "Inbox");
  if (inboxIdeas.length > 0) {
    alerts.push({
      id: "inbox-ideas",
      icon: "💡",
      text: `${inboxIdeas.length} idea${inboxIdeas.length > 1 ? "s" : ""} sin convertir en inbox`,
      severity: "info",
    });
  }

  return alerts;
}

export default function AlertsSurface({ clients, ideas }: AlertsSurfaceProps) {
  const alerts = buildAlerts(clients, ideas);

  if (alerts.length === 0) return null;

  return (
    <section className="px-5 mb-4">
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-2.5 px-3.5 py-3 rounded-2xl text-sm font-sans ${
              alert.severity === "warn"
                ? "bg-orange-50 border border-orange-200 text-orange-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
            }`}
          >
            <span className="text-base leading-snug shrink-0">{alert.icon}</span>
            <span className="leading-snug">{alert.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
