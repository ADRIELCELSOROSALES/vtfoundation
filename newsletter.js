/* ------------------------------------------------------------------
   Formulario de voluntariado — validación + envío a Formspree.

   PARA ACTIVARLO:
   1) Creá una cuenta gratis en https://formspree.io con el correo
      donde querés recibir los envíos (adrielrosales1999@gmail.com).
   2) Creá un formulario nuevo: te dan un ID (ej. "xzzabcde").
   3) En index.html, reemplazá  YOUR_FORM_ID  por ese ID en:
      action="https://formspree.io/f/YOUR_FORM_ID"

   Mientras el action tenga "YOUR_FORM_ID", el formulario solo muestra
   la confirmación en pantalla sin enviar nada (modo demo).
------------------------------------------------------------------ */
(function () {
  const form = document.getElementById("volunteer-form");
  if (!form) return;

  const ERR = "#c0392b";
  const markError = (el, on) => { el.style.borderColor = on ? ERR : ""; };

  const showMessage = (text) => {
    const done = document.createElement("p");
    done.className = "join-ok";
    done.setAttribute("role", "status");
    done.textContent = text;
    form.replaceWith(done);
  };

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = form.querySelector("#vol-name");
    const email = form.querySelector("#vol-email");
    const area = form.querySelector("#vol-area");

    let firstError = null;
    const check = (el, valid) => {
      markError(el, !valid);
      if (!valid && !firstError) firstError = el;
    };

    check(name, !!name.value.trim());
    check(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email.value || "").trim()));
    check(area, !!area.value);

    if (firstError) {
      firstError.focus();
      return;
    }

    const endpoint = form.getAttribute("action") || "";

    // Modo demo: todavía no se configuró el ID de Formspree.
    if (endpoint.includes("YOUR_FORM_ID")) {
      showMessage("¡Gracias por sumarte como voluntario/a! Te vamos a contactar por correo a la brevedad.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando…"; }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        showMessage("¡Gracias por sumarte como voluntario/a! Recibimos tus datos y te vamos a contactar por correo a la brevedad.");
      } else {
        throw new Error("Formspree respondió con error");
      }
    } catch (err) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Quiero ser voluntario/a"; }
      let notice = form.querySelector(".form-error");
      if (!notice) {
        notice = document.createElement("p");
        notice.className = "form-error";
        notice.setAttribute("role", "alert");
        form.appendChild(notice);
      }
      notice.textContent = "No pudimos enviar el formulario. Probá de nuevo o escribinos a info@vtfoundation.com.";
    }
  });
})();
