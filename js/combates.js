// combates.js — Fight bar conectada con Pages CMS
async function cargarFightBar() {
  let combates;
  try {
    const res = await fetch("/api/combates-index");
    if (!res.ok) throw new Error();
    combates = await res.json();
  } catch {
    return; // Sin datos, la barra no aparece
  }

  if (!combates.length) return;

  let index = 0;
  const container = document.getElementById("fight-bar-container");
  const cartelaImg = document.getElementById("cartelera-img");

  function renderCombate(combate) {
    const fechaObj = new Date(combate.fecha + "T" + combate.hora);
    const ahora    = new Date();
    const diff     = fechaObj - ahora;

    const esHoy = diff > -86400000 && diff <= 0;
    const esFuturo = diff > 0;

    const label = esHoy
      ? "🔥 HOY HAY COMBATE 🔥"
      : esFuturo
        ? "PRÓXIMA PELEA"
        : "RESULTADO";

    const fechaTexto = fechaObj.toLocaleDateString("es-ES", {
      day: "numeric", month: "long"
    });

    const countdownHTML = esFuturo
      ? `<span class="fight-countdown" id="countdown"></span>`
      : "";

    // Título del evento si existe (campo titulo) o fallback peleador vs rival
    const titulo = combate.peleador && combate.rival
      ? `${combate.peleador} <span class="fight-vs">VS</span> ${combate.rival}`
      : combate.titulo || "";

    container.innerHTML = `
      <div class="fight-bar">
        <a href="${combate.imagen ? '#cartelera' : '#'}" class="fight-link">
          <span class="fight-label">${label}</span>
          <span class="fight-main">${titulo}</span>
          <span class="fight-extra">
            📍 ${combate.lugar} · 🗓️ ${fechaTexto} · 🕘 ${combate.hora}
          </span>
          ${countdownHTML}
        </a>
      </div>
    `;

    // Actualiza imagen del modal si existe
    if (cartelaImg) {
      cartelaImg.src = combate.imagen || "";
    }

    // Lanza countdown si es futuro
    if (esFuturo) iniciarCountdown(fechaObj);
  }

  function iniciarCountdown(fechaObj) {
    const el = document.getElementById("countdown");
    if (!el) return;
    const tick = () => {
      const diff = fechaObj - new Date();
      if (diff <= 0) { el.innerHTML = "🔥 EN CURSO 🔥"; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      el.innerHTML = `⏳ ${d}d ${h}h ${m}m ${s}s`;
    };
    tick();
    const timer = setInterval(tick, 1000);
    // Limpia el timer si hay carrusel y cambia de slide
    el._timer = timer;
  }

  renderCombate(combates[index]);

  // Carrusel automático si hay más de uno
  if (combates.length > 1) {
    setInterval(() => {
      // Limpia countdown anterior
      const prev = document.getElementById("countdown");
      if (prev?._timer) clearInterval(prev._timer);
      index = (index + 1) % combates.length;
      renderCombate(combates[index]);
    }, 8000);
  }
}

cargarFightBar();