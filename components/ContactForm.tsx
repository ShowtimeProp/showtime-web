"use client";

import React from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export default function ContactForm({ locale = "es" }: { locale?: string }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [website, setWebsite] = React.useState(""); // honeypot
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState<null | boolean>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  React.useEffect(() => {
    if (!siteKey) return; // allow running without captcha in dev
    if (typeof window === 'undefined') return;
    if (document.getElementById('recaptcha-v3')) return;
    const s = document.createElement('script');
    s.id = 'recaptcha-v3';
    s.async = true;
    s.defer = true;
    s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    document.body.appendChild(s);
  }, [siteKey]);

  const t = (k: string) => {
    const dict: Record<string, Record<string, string>> = {
      es: { title: "Envíanos un mensaje", name: "Nombre", email: "Email", phone: "Teléfono", message: "Mensaje", send: "Enviar", sending: "Enviando...", required: "Requerido", invalid: "Email inválido", success: "Enviado. Te contactaremos a la brevedad.", error: "Ocurrió un error. Intenta nuevamente.", or: "o bien", whatsapp: "Escribir por WhatsApp" },
      pt: { title: "Envie uma mensagem", name: "Nome", email: "Email", phone: "Telefone", message: "Mensagem", send: "Enviar", sending: "Enviando...", required: "Obrigatório", invalid: "Email inválido", success: "Enviado. Entraremos em contato em breve.", error: "Ocorreu um erro. Tente novamente.", or: "ou", whatsapp: "Escrever no WhatsApp" },
      en: { title: "Send us a message", name: "Name", email: "Email", phone: "Phone", message: "Message", send: "Send", sending: "Sending...", required: "Required", invalid: "Invalid email", success: "Sent. We'll get back to you soon.", error: "Something went wrong. Please try again.", or: "or", whatsapp: "Write on WhatsApp" },
    };
    return dict[locale as keyof typeof dict]?.[k] || dict.en[k];
  };

  const emailValid = (e: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(e);

  const waPrefill = (() => {
    if (locale === 'pt') return 'Olá! Gostaria de consultar sobre os serviços da Showtime Prop.';
    if (locale === 'en') return "Hi! I'd like to ask about Showtime Prop services.";
    return '¡Hola! Me gustaría consultar por los servicios de Showtime Prop.';
  })();
  const waHref = `https://wa.me/5492233544057?text=${encodeURIComponent(waPrefill)}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (website) { return; } // honeypot: bots fill this
    if (!name || !email || !message) { setSent(false); return; }
    if (!emailValid(email)) { setSent(false); return; }
    setSending(true);
    try {
      // Get reCAPTCHA v3 token if configured
      let token: string | undefined = undefined;
      if (siteKey && window.grecaptcha) {
        await new Promise<void>((resolve) => window.grecaptcha!.ready(() => resolve()));
        token = await window.grecaptcha!.execute(siteKey, { action: 'contact' });
      }
      const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;
      const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, locale, token, website, pageUrl, referrer }),
      });
      if (!res.ok) throw new Error('send-failed');
      setSent(true);
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch {
      setSent(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="spotlight card-surface p-5 rounded-xl space-y-4">
      <h3 className="text-lg font-semibold">{t("title")}</h3>
      {/* Honeypot */}
      <div className="hidden">
        <label>Website</label>
        <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label className="block text-xs mb-1">{t("name")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/15"
          placeholder={t("name")}
          required
        />
      </div>
      <div>
        <label className="block text-xs mb-1">{t("email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/15"
          placeholder="name@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-xs mb-1">{t("phone")}</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/15"
          placeholder="+54 9 11..."
        />
      </div>
      <div>
        <label className="block text-xs mb-1">{t("message")}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/15 min-h-[120px]"
          placeholder={t("message")}
          required
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={sending}
          className="btn btn-gradient disabled:opacity-60"
        >
          {sending ? t("sending") : t("send")}
        </button>
        {sent === true ? (
          <span className="text-xs text-emerald-300">{t("success")}</span>
        ) : sent === false ? (
          <span className="text-xs text-red-300">{t("error")}</span>
        ) : null}
        <span className="text-xs text-white/50">{t("or")}</span>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition-colors text-xs"
        >
          {/* WA icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.52 3.48A11.87 11.87 0 0 0 12 0C5.5 0 .22 5.28.22 11.78c0 2.07.54 4.06 1.57 5.82L0 24l6.55-1.7a11.6 11.6 0 0 0 5.45 1.39h.01c6.5 0 11.78-5.28 11.78-11.78 0-3.15-1.23-6.11-3.27-8.15ZM12 21.2c-1.74 0-3.44-.47-4.93-1.37l-.35-.21-3.89 1.01 1.04-3.79-.22-.39A9.39 9.39 0 0 1 2.8 11.8C2.8 6.9 6.9 2.8 11.8 2.8S20.8 6.9 20.8 11.8 17.1 21.2 12 21.2Zm5.4-7.42c-.29-.14-1.7-.84-1.97-.93-.26-.1-.45-.14-.64.14-.19.29-.74.93-.91 1.12-.17.19-.34.21-.63.07-.29-.14-1.24-.46-2.36-1.47-.87-.77-1.46-1.71-1.64-2-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.48h-.55c-.19 0-.5.07-.76.36-.26.29-.99.97-.99 2.36 0 1.39 1.02 2.74 1.16 2.93.14.19 2.01 3.08 4.86 4.32.68.29 1.21.46 1.62.59.68.22 1.29.19 1.78.12.54-.08 1.7-.7 1.94-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.33Z" />
          </svg>
          {t("whatsapp")}
        </a>
      </div>
    </form>
  );
}
