export default function PrivacyBody() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-white/80 [&_a]:text-sky-400 [&_a]:hover:underline">
      <p className="text-white/60 text-xs">Última actualización: 19 de abril de 2026</p>
      <p>
        ShowtimeProp (en adelante, &quot;ShowtimeProp&quot;, &quot;nosotros&quot; o &quot;la Empresa&quot;) respeta tu
        privacidad y protege tus datos personales. Esta Política de Privacidad explica qué datos recopilamos, para qué
        los usamos y qué derechos tenés.
      </p>

      <section className="pt-2">
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">1. Responsable del tratamiento</h2>
        <p>Responsable: [RAZÓN SOCIAL LEGAL DE SHOWTIMEPROP]</p>
        <p>
          Sitio web:{" "}
          <a href="https://showtimeprop.com" target="_blank" rel="noopener noreferrer">
            https://showtimeprop.com
          </a>
        </p>
        <p>
          Email de contacto:{" "}
          <a href="mailto:showtimeprop@gmail.com">showtimeprop@gmail.com</a>
        </p>
        <p>Domicilio: [DOMICILIO LEGAL]</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">2. Datos que recopilamos</h2>
        <p>Podemos recopilar:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Datos de registro y cuenta: nombre, email, teléfono, empresa.</li>
          <li>Datos de uso de la plataforma: actividad, configuraciones, logs técnicos.</li>
          <li>
            Datos de integración con Google (si autorizás): información de perfil básica, acceso a Google Calendar y/o
            Gmail según los permisos otorgados.
          </li>
          <li>Datos técnicos: IP, navegador, dispositivo, cookies y métricas de uso.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">3. Finalidad del tratamiento</h2>
        <p>Usamos los datos para:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Proveer y operar el CRM y sus funcionalidades.</li>
          <li>Permitir autenticación e inicio de sesión.</li>
          <li>Sincronizar agendas y eventos con Google Calendar.</li>
          <li>Enviar comunicaciones desde cuentas autorizadas (por ejemplo, Gmail) cuando el usuario lo habilita.</li>
          <li>Mejorar la seguridad, prevenir fraude y cumplir obligaciones legales.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">4. Base legal</h2>
        <p>Tratamos datos sobre la base de:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ejecución del contrato de servicio.</li>
          <li>Consentimiento del usuario para integraciones y funcionalidades opcionales.</li>
          <li>Interés legítimo en seguridad y mejora del servicio.</li>
          <li>Cumplimiento de obligaciones legales.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">5. Uso de datos de Google APIs</h2>
        <p>
          Si conectás tu cuenta de Google, ShowtimeProp accede únicamente a los permisos que aceptés. El uso y
          transferencia de información recibida desde Google APIs por parte de ShowtimeProp cumple con la{" "}
          <strong className="text-white/90">Política de Datos de Usuario de Google API Services</strong>, incluidos los
          requisitos de <strong className="text-white/90">Uso Limitado</strong>. No vendemos datos provenientes de
          Google APIs y no los usamos para publicidad personalizada.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">6. Compartición de datos</h2>
        <p>Podemos compartir datos con:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Proveedores tecnológicos que prestan servicios para operar la plataforma (hosting, correo, monitoreo, etc.).</li>
          <li>Autoridades competentes cuando exista obligación legal.</li>
        </ul>
        <p>No compartimos tus datos con terceros para venta de bases de datos.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">7. Conservación de datos</h2>
        <p>
          Conservamos los datos por el tiempo necesario para prestar el servicio, cumplir obligaciones legales, resolver
          disputas y aplicar nuestros acuerdos.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">8. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger la información contra acceso no autorizado,
          alteración, pérdida o destrucción.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">9. Derechos del usuario</h2>
        <p>
          Podés solicitar acceso, actualización, rectificación o eliminación de tus datos, y revocar consentimientos
          otorgados para integraciones. Para ejercer estos derechos, escribinos a:{" "}
          <a href="mailto:showtimeprop@gmail.com">showtimeprop@gmail.com</a>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">10. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta Política. Publicaremos la versión vigente con su fecha de actualización en esta misma
          página.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mt-6 mb-3">11. Contacto</h2>
        <p>
          Consultas sobre privacidad:{" "}
          <a href="mailto:showtimeprop@gmail.com">showtimeprop@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
