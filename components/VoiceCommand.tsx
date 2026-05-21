"use client";

import { useState, useRef, useCallback } from "react";
import type { Client, NoteType } from "@/types";

interface VoiceCommandProps {
  clients: Client[];
  onSaved: () => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const NOTE_TYPES: NoteType[] = ["Idea", "Reunión", "Referencia", "Briefing", "Otro"];

interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: Event) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionCtor;
    webkitSpeechRecognition: SpeechRecognitionCtor;
  }
}

export default function VoiceCommand({ clients, onSaved }: VoiceCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [tipo, setTipo] = useState<NoteType>("Idea");
  const [clienteId, setClienteId] = useState<string>("");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = useCallback(() => {
    const SR: SpeechRecognitionCtor | undefined =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: Event) => {
      const event = e as SpeechRecognitionEvent;
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!transcript.trim()) return;
    setSaveState("saving");

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: transcript.trim(),
          tipo,
          clienteId: clienteId || null,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setSaveState("saved");
      onSaved();
      setTimeout(() => {
        setIsOpen(false);
        setTranscript("");
        setSaveState("idle");
        setTipo("Idea");
        setClienteId("");
      }, 1200);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2000);
    }
  }, [transcript, tipo, clienteId, onSaved]);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center text-xl active:scale-95 transition-transform z-40"
        aria-label="Agregar nota por voz"
      >
        🎙️
      </button>

      {/* Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !isListening && setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-cream rounded-t-3xl p-6 pb-10 shadow-2xl">
            <div className="w-10 h-1 bg-cream-border rounded-full mx-auto mb-5" />

            <h2 className="font-serif text-xl font-semibold text-gray-800 mb-4">
              Nueva nota
            </h2>

            {/* Transcript area */}
            <div className="mb-4">
              <div
                className={`min-h-[80px] rounded-2xl border px-4 py-3 text-sm font-sans text-gray-700 transition-colors ${
                  isListening
                    ? "border-red-300 bg-red-50"
                    : "border-cream-border bg-white"
                }`}
              >
                {transcript || (
                  <span className="text-gray-400">
                    {isListening ? "Escuchando…" : "Presioná el micrófono o escribí aquí"}
                  </span>
                )}
              </div>

              {/* Editable fallback */}
              {!isListening && (
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-cream-border bg-white px-3 py-2 text-sm font-sans text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                  placeholder="O escribí tu nota…"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              )}
            </div>

            {/* Tipo */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide font-sans">
                Tipo
              </label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {NOTE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold font-sans transition-colors ${
                      tipo === t
                        ? "bg-gray-900 text-white"
                        : "bg-cream-dark text-gray-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Cliente */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide font-sans">
                Cliente (opcional)
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-cream-border bg-white px-3 py-2 text-sm font-sans text-gray-700 focus:outline-none focus:border-gray-400"
              >
                <option value="">Sin cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm font-sans transition-colors ${
                  isListening
                    ? "bg-red-100 text-red-700"
                    : "bg-cream-dark text-gray-700"
                }`}
              >
                {isListening ? "⏹ Detener" : "🎙️ Grabar"}
              </button>

              <button
                onClick={handleSave}
                disabled={!transcript.trim() || saveState === "saving"}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm font-sans transition-colors ${
                  saveState === "saved"
                    ? "bg-green-100 text-green-700"
                    : saveState === "error"
                    ? "bg-red-100 text-red-700"
                    : "btn-primary disabled:opacity-40"
                }`}
              >
                {saveState === "saving"
                  ? "Guardando…"
                  : saveState === "saved"
                  ? "✓ Guardado"
                  : saveState === "error"
                  ? "Error"
                  : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
