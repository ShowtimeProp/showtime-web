"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Error enviando el formulario");
      }
      setStatus("ok");
      form.reset();
    } catch (err: any) {
      setError(err?.message || "Error desconocido");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            name="name"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Teléfono</label>
          <input
            name="phone"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Servicio de interés</label>
          <select name="service" className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="fotografia">Fotografía profesional</option>
            <option value="tour360">Tour virtual / Video 360</option>
            <option value="edicion">Edición de video</option>
            <option value="unreal">Planos Unreal Engine</option>
            <option value="ia">Automatizaciones / IA (n8n)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Mensaje</label>
        <textarea
          name="message"
          rows={5}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Cuéntanos sobre tu proyecto"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-black/90 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Enviar"}
      </button>

      {status === "ok" && (
        <p className="text-sm text-green-600">¡Gracias! Te contactaremos pronto.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{error || "Ocurrió un error."}</p>
      )}
    </form>
  );
}
