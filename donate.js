/* ------------------------------------------------------------------
   Donación para financiar la app de alfabetización.
   Flujo: frecuencia -> monto -> email (opcional) -> método de pago.
   Métodos: PayPal (internacional) y Mercado Pago (Argentina/región).
   Configurá tus datos aquí abajo.
------------------------------------------------------------------ */
const CONFIG = {
  currency: "USD",
  // Concepto que verá el donante en PayPal, según el destino elegido.
  itemName: {
    general: "Donación a VT Foundation — programas generales",
    app: "Aporte a la app de alfabetización — VT Foundation (Fase 1)",
  },

  // --- PayPal (botón clásico, sin backend) ---
  paypalBusinessEmail: "hola@vtfoundation.org",
  paypalSandbox: false, // true para pruebas

  // --- Mercado Pago ---
  // Creá links de pago en tu panel de MP y pegalos acá.
  // (MP no permite montos dinámicos sin backend: lo ideal es un link por
  //  monto, o un checkout propio. Como respaldo usamos estos links fijos.)
  mercadoPagoLinkOnce: "https://mpago.la/REEMPLAZAR",
  mercadoPagoLinkMonthly: "https://mpago.la/REEMPLAZAR-SUSCRIPCION",
};

const PAYPAL_URL = CONFIG.paypalSandbox
  ? "https://www.sandbox.paypal.com/cgi-bin/webscr"
  : "https://www.paypal.com/cgi-bin/webscr";

// ---- estado ----
const state = { destino: "general", freq: "once", amount: 30 }; // coincide con el HTML

// ---- elementos ----
const destBtns    = document.querySelectorAll(".dest-btn");
const freqBtns    = document.querySelectorAll(".freq-btn");
const grid        = document.getElementById("amount-grid");
const customWrap  = document.getElementById("custom-amount-wrap");
const customInput = document.getElementById("custom-amount");
const impactLine  = document.getElementById("impact-line");
const emailInput  = document.getElementById("donor-email");
const payAmtEls   = document.querySelectorAll(".pay-amt");
const payBtns     = document.querySelectorAll(".pay-btn");

// ---- helpers ----
function currentAmount(){
  if (customWrap.classList.contains("show")){
    return Math.max(0, Number(customInput.value) || 0);
  }
  return state.amount;
}

function freqSuffix(){
  return state.freq === "monthly" ? " al mes" : "";
}

function refresh(){
  const amt = currentAmount();
  const label = amt > 0 ? `$${amt}${freqSuffix()}` : "—";
  payAmtEls.forEach(el => (el.textContent = label));
  const verb = state.destino === "app" ? "ayudás a construir" : "hacés posible";
  impactLine.innerHTML = amt > 0
    ? `Con $${amt}${freqSuffix()} ${verb} ${vtImpact(amt, state.destino)}.`
    : "";
}

// ---- destino ----
// Preselección desde ?destino=app|general (viene de los CTA de la home).
const urlDest = new URLSearchParams(location.search).get("destino");
if (urlDest === "app" || urlDest === "general") state.destino = urlDest;
destBtns.forEach(b =>
  b.setAttribute("aria-pressed", String(b.dataset.dest === state.destino))
);
destBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    state.destino = btn.dataset.dest;
    destBtns.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    refresh();
  });
});

// ---- frecuencia ----
freqBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    state.freq = btn.dataset.freq;
    freqBtns.forEach(b =>
      b.setAttribute("aria-pressed", String(b === btn))
    );
    refresh();
  });
});

// ---- monto ----
grid.querySelectorAll(".amount-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    grid.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    if (btn.dataset.amount === "other"){
      customWrap.classList.add("show");
      customInput.focus();
    } else {
      customWrap.classList.remove("show");
      state.amount = Number(btn.dataset.amount);
    }
    refresh();
  });
});
customInput.addEventListener("input", refresh);

// ---- pago ----
payBtns.forEach(btn => {
  btn.addEventListener("click", () => donate(btn.dataset.method));
});

function donate(method){
  const amount = currentAmount();
  if (!amount || amount < 1){
    customWrap.classList.add("show");
    customInput.focus();
    impactLine.textContent = "Ingresá un monto de al menos $1.";
    return;
  }

  // Guardamos el detalle para la pantalla de gracias (sobrevive la redirección).
  try {
    localStorage.setItem("vt_last_donation",
      JSON.stringify({ amount, freq: state.freq, destino: state.destino }));
  } catch (_) {}

  const returnUrl = new URL("gracias.html", window.location.href);
  returnUrl.searchParams.set("amount", amount);
  returnUrl.searchParams.set("freq", state.freq);
  returnUrl.searchParams.set("destino", state.destino);

  if (method === "mercadopago"){
    window.location.href = state.freq === "monthly"
      ? CONFIG.mercadoPagoLinkMonthly
      : CONFIG.mercadoPagoLinkOnce;
    return;
  }

  // PayPal (formulario clásico)
  submitPayPal(amount, returnUrl.toString());
}

function submitPayPal(amount, returnUrl){
  const cancelUrl = new URL("donar.html", window.location.href).toString();
  const form = document.createElement("form");
  form.method = "post";
  form.action = PAYPAL_URL;
  form.target = "_top";

  let fields;
  if (state.freq === "monthly"){
    // Suscripción mensual
    fields = {
      cmd: "_xclick-subscribe",
      business: CONFIG.paypalBusinessEmail,
      item_name: CONFIG.itemName[state.destino],
      currency_code: CONFIG.currency,
      a3: amount,   // importe por periodo
      p3: "1",      // cada 1
      t3: "M",      // mes
      src: "1",     // recurrente
      sra: "1",     // reintentar si falla
      no_note: "1",
      return: returnUrl,
      cancel_return: cancelUrl,
      rm: "1",
    };
  } else {
    // Donación única
    fields = {
      cmd: "_donations",
      business: CONFIG.paypalBusinessEmail,
      item_name: CONFIG.itemName[state.destino],
      currency_code: CONFIG.currency,
      amount: amount,
      no_recurring: "1",
      return: returnUrl,
      cancel_return: cancelUrl,
      rm: "1",
    };
  }
  if (emailInput.value.trim()){
    fields.custom = emailInput.value.trim(); // referencia para tu registro
  }

  for (const [name, value] of Object.entries(fields)){
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

// estado inicial
refresh();
