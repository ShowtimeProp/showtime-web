export const metadata = {
  title: "Contacto",
  description: "Solicita una cotización o agenda una llamada.",
};

import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <div className="px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contacto</h1>
      <p className="text-neutral-600 mb-8">
        Completa el formulario y te responderemos a la brevedad. También puedes
        escribirnos para coordinar una demo de los tours y planos interactivos.
      </p>

      <ContactForm />
    </div>
  );
}
