import { NextResponse } from "next/server";

async function verifyRecaptcha(token?: string) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret || !token) return { ok: true, skipped: true } as const; // allow if not configured
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    if (!data.success) return { ok: false as const, reason: "recaptcha_fail" };
    const score = typeof data.score === 'number' ? data.score : 1;
    if (score < 0.5) return { ok: false as const, reason: "recaptcha_score_low", score };
    return { ok: true as const, score };
  } catch (e) {
    return { ok: false as const, reason: "recaptcha_error" };
  }
}

function emailHtml({ name, email, phone, message, locale, pageUrl, referrer }: { name: string; email: string; phone?: string; message: string; locale?: string; pageUrl?: string; referrer?: string }) {
  const safe = (s: string) => s.replace(/[<>]/g, (m) => ({ '<': '&lt;', '>': '&gt;' }[m] as string));
  return `
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#0b0a10;padding:24px;color:#ffffff;font-family:Segoe UI,Arial,sans-serif;">
    <tr>
      <td align="center">
        <table width="560" style="background:linear-gradient(180deg,#1a1722,#13111a);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;">
          <tr>
            <td style="font-size:18px;font-weight:600;">Nuevo contacto desde el sitio</td>
          </tr>
          <tr><td style="height:12px"></td></tr>
          <tr>
            <td style="font-size:14px;line-height:1.6">
              <strong>Nombre:</strong> ${safe(name)}<br/>
              <strong>Email:</strong> ${safe(email)}<br/>
              <strong>Teléfono:</strong> ${safe(phone || '-') }<br/>
              <strong>Idioma:</strong> ${safe(locale || '-')}
              ${pageUrl ? `<br/><strong>Página:</strong> ${safe(pageUrl)}` : ''}
              ${referrer ? `<br/><strong>Referrer:</strong> ${safe(referrer)}` : ''}
            </td>
          </tr>
          <tr><td style="height:16px"></td></tr>
          <tr>
            <td style="font-size:14px;line-height:1.6;white-space:pre-wrap;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px;">${safe(message)}</td>
          </tr>
          <tr><td style="height:16px"></td></tr>
          <tr>
            <td style="font-size:12px;color:#bbbbc2">Este correo fue generado por el formulario de contacto del sitio.</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });

    const { name, email, phone, message, locale, website, token, pageUrl, referrer } = body || {};

    // Honeypot (if client sends it)
    if (website && typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Verify reCAPTCHA if configured
    const vr = await verifyRecaptcha(token);
    if (!vr.ok) {
      return NextResponse.json({ ok: false, error: vr.reason || "recaptcha" }, { status: 400 });
    }

    // If we have an n8n webhook configured, forward the entire payload there and return its result
    const webhook = process.env.N8N_WEBHOOK_URL;
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return NextResponse.json(
          { ok: false, error: `n8n error: ${res.status} ${text}` },
          { status: 502 }
        );
      }
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ ok: true, data, forwarded: true });
    }

    // Otherwise try to send an email via Resend (if configured)
    const TO = process.env.TO_EMAIL || "showtimeprop@gmail.com";
    const FROM = process.env.FROM_EMAIL || "contact@showtimeprop.com"; // must be verified in Resend
    const API = process.env.RESEND_API_KEY;

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    if (API) {
      const subject = `[Contact] ${name} (${locale || ""})`;
      const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\nLocale: ${locale || "-"}\nPage: ${pageUrl || "-"}\nReferrer: ${referrer || "-"}\n\nMessage:\n${message}`;
      const html = emailHtml({ name, email, phone, message, locale, pageUrl, referrer });
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM, to: [TO], subject, text, html, reply_to: email }),
      });
      if (!res.ok) {
        const info = await res.text().catch(() => "");
        console.warn("Resend send failed", info);
        return NextResponse.json({ ok: false, queued: false }, { status: 200 });
      }
      return NextResponse.json({ ok: true, queued: true });
    }

    // No outbound configured, but request is valid
    console.warn("No N8N_WEBHOOK_URL or RESEND_API_KEY configured; received contact message for:", TO);
    return NextResponse.json({ ok: true, queued: false, forwarded: false });
  } catch (e) {
    console.error("/api/contact error", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
