"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  locale: "es" | "en" | "pt";
};

function formatDateKey(d = new Date()) {
  // YYYY-MM-DD in user's local time
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function WhatsAppWidget({ locale }: Props) {
  const [showBubble, setShowBubble] = useState(false);
  const [ready, setReady] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Config
  const DELAY_MS = 20000; // 20s
  const MIN_GAP_MS = 60 * 60 * 1000; // 1h
  const DAILY_MAX = 2; // twice per day

  const phone = "5492233544057"; // TODO: move to env if needed

  const messages = useMemo(() => ({
    es: {
      bubble: "¿En qué podemos ayudarte hoy?",
      wa: "Hola! Tengo una consulta sobre sus servicios.",
      aria: "Abrir WhatsApp",
    },
    en: {
      bubble: "How can we help you today?",
      wa: "Hi! I have a question about your services.",
      aria: "Open WhatsApp",
    },
    pt: {
      bubble: "Como podemos te ajudar hoje?",
      wa: "Olá! Tenho uma dúvida sobre seus serviços.",
      aria: "Abrir WhatsApp",
    },
  }), []);

  const t = messages[locale] || messages.es;

  // Storage keys
  const dayKey = useMemo(() => `waBubble:count:${formatDateKey()}`, []);
  const lastShownKey = "waBubble:lastShown";

  // Decide if we can show the bubble now
  function canShow(): boolean {
    try {
      const count = parseInt(localStorage.getItem(dayKey) || "0", 10) || 0;
      if (count >= DAILY_MAX) return false;
      const last = parseInt(localStorage.getItem(lastShownKey) || "0", 10) || 0;
      if (last && Date.now() - last < MIN_GAP_MS) return false;
      return true;
    } catch {
      return true;
    }
  }

  function markShown() {
    try {
      const count = parseInt(localStorage.getItem(dayKey) || "0", 10) || 0;
      localStorage.setItem(dayKey, String(Math.min(count + 1, DAILY_MAX)));
      localStorage.setItem(lastShownKey, String(Date.now()));
    } catch {}
  }

  useEffect(() => {
    setReady(true);
    if (!canShow()) return;
    timerRef.current = window.setTimeout(() => {
      setShowBubble(true);
      markShown();
    }, DELAY_MS) as unknown as number;
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey]);

  function closeBubble() {
    setShowBubble(false);
  }

  function waHref() {
    // Include current pathname for context
    const page = typeof window !== "undefined" ? window.location.pathname : "/";
    const text = `${t.wa} (${page})`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  // Basic styles (Tailwind classes if available)
  return (
    <div aria-live="polite" aria-atomic="true">
      {/* Floating button */}
      <a
        href={waHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.aria}
        className="fixed z-50 right-5 bottom-5 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        style={{ width: 56, height: 56, backgroundColor: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}
        data-lead
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" fill="#fff" aria-hidden="true">
          <path d="M19.11 17.53c-.26-.13-1.53-.76-1.77-.85-.24-.09-.42-.13-.6.13-.17.26-.69.85-.85 1.02-.16.17-.31.2-.57.07-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.43.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.6-1.45-.82-1.98-.22-.53-.44-.45-.6-.45h-.51c-.17 0-.45.06-.68.32-.24.26-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.38 3.89.61.26 1.08.42 1.45.54.61.19 1.17.16 1.61.1.49-.07 1.53-.62 1.75-1.22.22-.6.22-1.11.15-1.22-.06-.11-.24-.17-.5-.3z"/>
          <path d="M26.07 5.93C23.34 3.2 19.82 1.71 16 1.71 8.76 1.71 2.99 7.48 2.99 14.71c0 2.27.59 4.49 1.72 6.45L2 30l9-2.65c1.88 1.02 4.01 1.56 6.22 1.56h.01c7.23 0 12.99-5.77 12.99-13.01 0-3.47-1.35-6.73-3.88-9.27zm-10.07 21.6h-.01c-1.97 0-3.9-.53-5.58-1.54l-.4-.24-5.34 1.57 1.59-5.2-.26-.42c-1.08-1.78-1.65-3.83-1.65-5.98C3.35 8.6 8.09 3.86 14 3.86c2.98 0 5.78 1.16 7.89 3.27 2.11 2.12 3.27 4.91 3.27 7.9 0 6.13-4.98 11.5-9.16 12.5z"/>
        </svg>
      </a>

      {/* Bubble prompt */}
      {ready && showBubble ? (
        <div className="fixed z-50 right-5 bottom-[78px] max-w-xs text-sm" role="dialog" aria-label="WhatsApp prompt">
          <div className="bg-white text-gray-900 rounded-2xl shadow-lg border border-gray-200 p-3 relative">
            <button
              onClick={closeBubble}
              aria-label="Cerrar"
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 text-xs"
            >
              ×
            </button>
            <div className="mb-2">{t.bubble}</div>
            <a
              href={waHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-white"
              style={{ backgroundColor: "#25D366" }}
              data-lead
            >
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
