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
  const [unread, setUnread] = useState(false);
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
  const unreadKey = "waBadge:unread";

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

  function handleClick() {
    // Clear unread badge when user engages
    try {
      localStorage.removeItem(unreadKey);
    } catch {}
    setUnread(false);
  }
  }

  function markShown() {
    try {
      const count = parseInt(localStorage.getItem(dayKey) || "0", 10) || 0;
      localStorage.setItem(dayKey, String(Math.min(count + 1, DAILY_MAX)));
      localStorage.setItem(lastShownKey, String(Date.now()));
      // Mark as unread so badge persists across visits until user clicks
      localStorage.setItem(unreadKey, "1");
      setUnread(true);
    } catch {}
  }

  useEffect(() => {
    setReady(true);
    // Restore unread badge state
    try {
      if (localStorage.getItem(unreadKey)) setUnread(true);
    } catch {}
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
    // Prefill only the localized greeting (omit pathname like /es)
    const text = t.wa;
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
        className="rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 relative overflow-visible"
        style={{ position: 'fixed', right: 20, left: 'auto', bottom: 20, zIndex: 1000, width: 56, height: 56, backgroundColor: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", border: '4px solid #fff' }}
        onClick={handleClick}
        data-lead
      >
        {/* Sonar pulse ring */}
        <span className="sonar-ring" aria-hidden="true" />
        {/* Notification badge when bubble is shown or unread persisted */}
        {showBubble || unread ? <span className="wa-badge" aria-hidden="true">1</span> : null}
        {/* Icon image from /public */}
        <img
          src={showBubble || unread ? "/whatsapp-badge.png" : "/whatsapp.png"}
          alt="WhatsApp"
          width={48}
          height={48}
          style={{ display: 'block', width: 48, height: 48 }}
        />
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
      {/* Sonar animation styles */}
      <style jsx>{`
        .sonar-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          pointer-events: none;
        }
        .wa-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background: #d32f2f;
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          line-height: 20px;
          text-align: center;
          border-radius: 9999px;
          border: 2px solid #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .sonar-ring::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid rgba(37, 211, 102, 0.65);
          animation: sonar 10s ease-out infinite;
        }
        @keyframes sonar {
          0% { transform: scale(1); opacity: 0; }
          1% { opacity: 0.65; }
          8% { transform: scale(1.9); opacity: 0; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
