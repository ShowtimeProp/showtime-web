import React from "react";

export default function SiteFooter({ locale = "es" }: { locale?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-8 border-t text-sm text-neutral-500 text-center">
      <p className="text-[10px] leading-relaxed text-white/45 max-w-5xl mx-auto">
        © {year} Showtime Prop — Todos los derechos reservados. Todo el contenido presente en este sitio web, incluyendo pero no limitándose a textos, gráficos, logotipos, iconos, imágenes, clips de audio y video, descargas digitales, compilaciones de datos y software, es propiedad exclusiva de Showtime Prop o de sus proveedores de contenido y está protegido por las leyes de derechos de autor nacionales e internacionales. El uso no autorizado de cualquier material en este sitio web, incluidos la reproducción, distribución, transmisión o modificación del contenido, sin el consentimiento previo y por escrito de Showtime Prop, está estrictamente prohibido y puede dar lugar a acciones legales.
      </p>
    </footer>
  );
}
