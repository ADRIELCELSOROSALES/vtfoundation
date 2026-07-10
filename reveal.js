/* ------------------------------------------------------------------
   Animaciones de scroll — una sola técnica visual: fade-in + translateY(20px).
   Además, dos animaciones "de progreso" que corren SOLO la 1ª vez en viewport:
     - anillos de los nodos del roadmap (se rellenan según su % de avance),
     - trazado de la línea del gráfico de alcance.
   Todo con ease-out (1.5–2s) y respetando prefers-reduced-motion.
------------------------------------------------------------------ */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsIO = "IntersectionObserver" in window;

  // ---- Reveal (fade-in + translateY) ----
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reduce || !supportsIO) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target); // solo la primera vez
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ---- Anillos de los nodos del roadmap ----
  // Estado inicial: vacío (offset = circunferencia). Guardamos el destino.
  const rings = document.querySelectorAll(".node-ring-progress");
  rings.forEach((ring) => {
    const r = ring.r.baseVal.value;
    const c = 2 * Math.PI * r;
    const pct = Number(ring.dataset.nodeProgress) || 0;
    ring.style.strokeDasharray = c;
    ring.style.strokeDashoffset = c; // vacío
    ring.dataset.target = c * (1 - pct / 100);
  });
  const fillRings = () => rings.forEach((ring) => {
    ring.style.strokeDashoffset = ring.dataset.target;
  });

  // ---- Trazado de la línea del gráfico de alcance ----
  const chart = document.querySelector(".reach-chart");
  const chartLine = chart ? chart.querySelector(".chart-line") : null;
  if (chartLine) {
    const len = chartLine.getTotalLength();
    chartLine.style.strokeDasharray = len;
    chartLine.style.strokeDashoffset = len; // sin dibujar
  }
  const drawChart = () => {
    if (chartLine) chartLine.style.strokeDashoffset = 0;
    if (chart) chart.classList.add("drawn"); // área, puntos y valores
  };

  // ---- Disparadores ----
  function runOnceInView(target, fn) {
    if (!target) return;
    if (reduce || !supportsIO) return fn();
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fn();
            o.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    obs.observe(target);
  }

  runOnceInView(document.querySelector("[data-roadmap]"), fillRings);
  runOnceInView(chart, drawChart);

  // ---- Contadores de impacto (0 -> valor, ease-out, 1ª vez en viewport) ----
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const fmt = (n) => Math.round(n).toLocaleString("es-AR");
  document.querySelectorAll("[data-count-to]").forEach((el) => {
    const to = Number(el.dataset.countTo) || 0;
    const run = () => {
      if (reduce) { el.textContent = fmt(to); return; }
      const dur = 1800, t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(to * easeOut(t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    runOnceInView(el, run);
  });
})();
