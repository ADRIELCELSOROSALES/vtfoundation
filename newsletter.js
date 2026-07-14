/* ------------------------------------------------------------------
   Formulario "Join us" — suscripción por email.
   Validación + confirmación en el cliente. Para guardar los correos
   de verdad hay que conectar un servicio (Mailchimp, Formspree, etc.)
   donde está el TODO de abajo.
------------------------------------------------------------------ */
(function () {
  const form = document.getElementById("join-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const input = document.getElementById("join-email");
    const email = (input.value || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.focus();
      input.style.borderColor = "#c0392b";
      return;
    }

    // TODO: enviar `email` a tu servicio de newsletter (Mailchimp/Formspree/backend).

    const ok = document.createElement("p");
    ok.className = "join-ok";
    ok.setAttribute("role", "status");
    ok.textContent = "¡Gracias por sumarte! Te vamos a escribir para contarte cómo avanza el trabajo.";
    form.replaceWith(ok);
  });
})();
