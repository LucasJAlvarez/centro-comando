"use client";

import { useEffect, useState } from "react";

type NotionStatus = "checking" | "online" | "offline";

interface HeaderProps {
  notionStatus: NotionStatus;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "Buenos días";
  if (h >= 12 && h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getDate(): string {
  return new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function Header({ notionStatus }: HeaderProps) {
  const [greeting, setGreeting] = useState(getGreeting());
  const [dateStr, setDateStr] = useState(getDate());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
      setDateStr(getDate());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="px-5 pt-8 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {dateStr}
          </p>
          <h1 className="font-serif text-2xl font-light text-gray-800 leading-tight">
            {greeting} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 font-sans">Centro de Comando</p>
        </div>

        <div className="flex flex-col items-end gap-1 mt-1">
          <NotionDot status={notionStatus} />
        </div>
      </div>
    </header>
  );
}

function NotionDot({ status }: { status: NotionStatus }) {
  const configs = {
    checking: { color: "bg-yellow-400", label: "Conectando…" },
    online: { color: "bg-green-400", label: "Notion online" },
    offline: { color: "bg-red-400", label: "Datos locales" },
  };
  const { color, label } = configs[status];

  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400 font-sans">
      <span className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      {label}
    </span>
  );
}
