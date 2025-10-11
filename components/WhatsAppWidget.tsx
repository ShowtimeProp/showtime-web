"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  locale: "es" | "en" | "pt";
  logoUrl?: string;
  bubbleText?: string;
};

function formatDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function WhatsAppWidget({ locale, logoUrl, bubbleText }: Props) {
  const [showBubble, setShowBubble] = useState(false);
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(false);
  const timerRef = useRef<number | null>(null);
  const autoHideRef = useRef<number | null>(null);

  // Config
  const DELAY_MS = 10000; // 10s
  const MIN_GAP_MS = 60 * 60 * 1000; // 1h
  const DAILY_MAX = 2; // twice per day

  const phone = "5492233544057"; // TODO: move to env if needed

  const messages = useMemo(
    () => ({
      es: {
        bubble: "¿Cómo podemos ayudarte hoy?",
        wa: "🤖 Hola! Tengo una consulta sobre sus servicios.",
        aria: "Abrir WhatsApp",
      },
      en: {
        bubble: "How can we help you today?",
        wa: "🤖 Hi! I have a question about your services.",
        aria: "Open WhatsApp",
      },
      pt: {
        bubble: "Como podemos te ajudar hoje?",
        wa: "🤖 Olá! Tenho uma dúvida sobre seus serviços.",
        aria: "Abrir WhatsApp",
      },
    }),
    []
  );

  // Optional overrides via environment variables
  // Precedence: per-locale > global > default
  const env = (typeof process !== 'undefined' && process.env) || {} as any;
  const bubbleByLocale = {
    es: env.NEXT_PUBLIC_WA_BUBBLE_TEXT_ES,
    en: env.NEXT_PUBLIC_WA_BUBBLE_TEXT_EN,
    pt: env.NEXT_PUBLIC_WA_BUBBLE_TEXT_PT,
  } as Record<string, string | undefined>;
  const greetingByLocale = {
    es: env.NEXT_PUBLIC_WA_GREETING_ES,
    en: env.NEXT_PUBLIC_WA_GREETING_EN,
    pt: env.NEXT_PUBLIC_WA_GREETING_PT,
  } as Record<string, string | undefined>;
  const overrideBubbleGlobal = env.NEXT_PUBLIC_WA_BUBBLE_TEXT || "";
  const overrideGreetingGlobal = env.NEXT_PUBLIC_WA_GREETING || "";
  const overrideBubble = (bubbleByLocale[locale] || overrideBubbleGlobal || "").trim();
  const overrideGreeting = (greetingByLocale[locale] || overrideGreetingGlobal || "").trim();

  // Support for specifying emoji via Unicode escapes in env (e.g., \uD83E\uDD16)
  function decodeUnicodeEscapes(input: string): string {
    if (!input) return "";
    try {
      return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, g1) => String.fromCharCode(parseInt(g1, 16)));
    } catch {
      return input;
    }
  }

  // Trigger emoji configurable; defaults to robot 🤖
  const triggerEmojiRaw = env.NEXT_PUBLIC_WA_TRIGGER_EMOJI || "🤖";
  const triggerEmoji = decodeUnicodeEscapes(triggerEmojiRaw);

  const t = messages[locale] || messages.es;
  // Remove waving-hand emoji (anywhere, any skin tone; with/without VS) to avoid line breaks
  function stripWavingHand(s: string) {
    if (!s) return s;
    try {
      const re = /\u{1F44B}(?:\uFE0F)?(?:\u{1F3FB}|\u{1F3FC}|\u{1F3FD}|\u{1F3FE}|\u{1F3FF})?/gu;
      return s.replace(re, '').replace(/\s{2,}/g, ' ').trim();
    } catch {
      // Fallback: simple replace of common form
      return s.replace(/[\uD83D\uDC4B]/g,'').replace(/\s{2,}/g, ' ').trim();
    }
  }
  const bubbleTextFinal = stripWavingHand((bubbleText && bubbleText.trim()) || overrideBubble || t.bubble);

  // Storage keys
  const dayKey = useMemo(() => `waBubble:count:${formatDateKey()}`, []);
  const lastShownKey = "waBubble:lastShown";
  const unreadKey = "waBadge:unreadUntil";

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

  function handleClick() {
    try {
      localStorage.removeItem(unreadKey);
    } catch {}
    setUnread(false);
  }

  // Show bubble immediately (e.g., on hover) respecting frequency limits
  function triggerBubbleNow() {
    // Only on devices that support hover (avoid on mobile)
    if (!(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches)) return;
    if (showBubble) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowBubble(true);
    startAutoHide();
  }

  function markShown() {
    try {
      const count = parseInt(localStorage.getItem(dayKey) || "0", 10) || 0;
      localStorage.setItem(dayKey, String(Math.min(count + 1, DAILY_MAX)));
      localStorage.setItem(lastShownKey, String(Date.now()));
      // TTL 3h
      const threeHours = 3 * 60 * 60 * 1000;
      localStorage.setItem(unreadKey, String(Date.now() + threeHours));
      setUnread(true);
    } catch {}
  }

  // Start/Reset auto-hide countdown (12s)
  function startAutoHide() {
    if (autoHideRef.current) {
      window.clearTimeout(autoHideRef.current);
      autoHideRef.current = null;
    }
    autoHideRef.current = window.setTimeout(() => {
      setShowBubble(false);
      autoHideRef.current = null;
    }, 12000) as unknown as number;
  }

  useEffect(() => {
    setReady(true);
    // Restore unread badge with TTL
    try {
      const raw = localStorage.getItem(unreadKey);
      if (raw) {
        const until = parseInt(raw, 10) || 0;
        if (until > Date.now()) setUnread(true);
        else localStorage.removeItem(unreadKey);
      }
    } catch {}
    if (!canShow()) return;
    timerRef.current = window.setTimeout(() => {
      setShowBubble(true);
      markShown();
    }, DELAY_MS) as unknown as number;
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (autoHideRef.current) window.clearTimeout(autoHideRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey]);

  function closeBubble() {
    setShowBubble(false);
    if (autoHideRef.current) {
      window.clearTimeout(autoHideRef.current);
      autoHideRef.current = null;
    }
  }

  function waHref() {
    // Ensure the trigger emoji is present at the beginning, even if greeting comes from env
    const base = decodeUnicodeEscapes(overrideGreeting) || t.wa;
    const withEmoji = base.startsWith(triggerEmoji) ? base : `${triggerEmoji} ${base}`;
    const text = withEmoji;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  function handleBubbleClick() {
    // Same behavior as clicking the icon, but avoid showing URL on hover
    handleClick();
    if (typeof window !== 'undefined') {
      window.open(waHref(), '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div aria-live="polite" aria-atomic="true">
      {/* Floating button */}
      <button
        type="button"
        role="link"
        aria-label={t.aria}
        className="rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 relative overflow-visible"
        style={{ position: 'fixed', right: 28, left: 'auto', bottom: 56, zIndex: 1000, width: 64, height: 64, backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => { handleClick(); if (typeof window !== 'undefined') window.open(waHref(), '_blank', 'noopener,noreferrer'); }}
        data-lead
        onMouseEnter={triggerBubbleNow}
      >
        <span className="sonar-ring" aria-hidden="true" />
        {showBubble || unread ? <span className="wa-badge" aria-hidden="true">1</span> : null}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="#fff" aria-hidden="true">
          <path d="M19.11 17.53c-.26-.13-1.53-.76-1.77-.85-.24-.09-.42-.13-.6.13-.17.26-.69.85-.85 1.02-.16.17-.31.2-.57.07-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.43.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.6-1.45-.82-1.98-.22-.53-.44-.45-.6-.45h-.51c-.17 0-.45.06-.68.32-.24.26-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.38 3.89.61.26 1.08.42 1.45.54.61.19 1.17.16 1.61.1.49-.07 1.53-.62 1.75-1.22.22-.6.22-1.11.15-1.22-.06-.11-.24-.17-.5-.3z"/>
          <path d="M26.07 5.93C23.34 3.2 19.82 1.71 16 1.71 8.76 1.71 2.99 7.48 2.99 14.71c0 2.27.59 4.49 1.72 6.45L2 30l9-2.65c1.88 1.02 4.01 1.56 6.22 1.56h.01c7.23 0 12.99-5.77 12.99-13.01 0-3.47-1.35-6.73-3.88-9.27zm-10.07 21.6h-.01c-1.97 0-3.9-.53-5.58-1.54l-.4-.24-5.34 1.57 1.59-5.2-.26-.42c-1.08-1.78-1.65-3.83-1.65-5.98C3.35 8.6 8.09 3.86 14 3.86c2.98 0 5.78 1.16 7.89 3.27 2.11 2.12 3.27 4.91 3.27 7.9 0 6.13-4.98 11.5-9.16 12.5z"/>
        </svg>
      </button>

      {/* Chat-style bubble (no inner CTA) */}
      {ready && showBubble ? (
        <div className="fixed z-50 max-w-xs text-sm" style={{ right: 28, bottom: 128 }} role="dialog" aria-label="Bot message">
          <div className="chat-bubble shadow-lg chat-enter" onClick={handleBubbleClick}>
            <div className="chat-header">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" width={18} height={18} className="avatar" loading="eager" decoding="async" />
              ) : (
                <span className="avatar-fallback" aria-hidden>✨</span>
              )}
              <div className="chat-label">Showtime Bot</div>
            </div>
            <div className="chat-text">{bubbleTextFinal}</div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeBubble(); }}
              aria-label="Cerrar"
              className="chat-close"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {/* Styles */}
      <style jsx>{`
        .sonar-ring { position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; }
        .wa-badge { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: #d32f2f; color: #fff; font-weight: 700; font-size: 12px; line-height: 20px; text-align: center; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .chat-bubble { position: relative; background: #fff; color: #111827; border: 1px solid #e5e7eb; border-radius: 18px; padding: 10px 12px; max-width: 280px; box-shadow: 0 10px 24px rgba(0,0,0,0.18); cursor: pointer; z-index: 1001; }
        /* Rotated-square tail refined */
        .chat-bubble::before { content: ""; position: absolute; right: -6px; bottom: 20px; width: 12px; height: 12px; background: #ffffff; transform: rotate(45deg); border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; box-shadow: 0 3px 8px rgba(0,0,0,0.10); }
        .chat-header { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
        .chat-label { font-weight: 700; font-size: 0.78rem; color: #111827; opacity: 0.75; }
        .chat-row { display: flex; align-items: flex-start; gap: 8px; }
        .chat-text { font-size: 0.95rem; line-height: 1.25rem; }
        .avatar { display: block; width: 18px; height: 18px; border-radius: 9999px; object-fit: cover; margin-top: 2px; }
        .avatar-fallback { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; margin-top: 0; }
        /* Simple fade+slide-in */
        .chat-enter { animation: chatFade 180ms ease-out; transform-origin: 100% 100%; }
        @keyframes chatFade { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .chat-close { position: absolute; top: -8px; right: -8px; background: #111827; color: #fff; width: 20px; height: 20px; border-radius: 9999px; font-size: 12px; line-height: 18px; z-index: 1002; }
        .sonar-ring::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; border: 2px solid rgba(37,211,102,0.5); animation: sonar 10s ease-out infinite; }
      `}</style>
    </div>
  );
}
