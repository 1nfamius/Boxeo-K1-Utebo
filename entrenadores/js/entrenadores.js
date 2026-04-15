let entrenadores = [];
let seleccionado  = null;

async function cargarEntrenadores() {
  const res = await fetch("/entrenadores/data/entrenadores.json");
  entrenadores = await res.json();

  if (!entrenadores.length) return;

  const selector = document.getElementById("entrenadores-selector");

  entrenadores.forEach((e, i) => {
    const card = document.createElement("div");
    card.classList.add("entrenador-card");
    card.id = `card-${e.id}`;
    card.dataset.id = e.id;
    card.style.setProperty("--disciplina-color", e.color);
    card.innerHTML = `
      <img
        class="entrenador-avatar"
        src="${e.foto_avatar}"
        alt="Foto de ${e.nombre}"
        onerror="this.onerror=null;this.style.opacity='0'"
      >
      <span class="entrenador-card-nombre">${e.nombre}</span>
      <span class="entrenador-card-disciplina" style="color:${e.color}">${e.disciplina}</span>
    `;
    card.addEventListener("click", () => mostrarEntrenador(i));
    selector.appendChild(card);
  });

  aplicarColoresDinamicos();

  // Si la URL tiene #id de disciplina, abrir ese entrenador
  const hash = window.location.hash.replace("#", "");
  const idxHash = hash ? entrenadores.findIndex(e => e.id === hash) : -1;
  mostrarEntrenador(idxHash >= 0 ? idxHash : 0);

  // Scroll al selector si venimos con ancla, respetando el header sticky
  if (idxHash >= 0) {
    setTimeout(() => {
      const selector = document.getElementById("entrenadores-selector");
      const headerH = document.querySelector("header")?.offsetHeight || 80;
      const top = selector.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: "smooth" });
    }, 150);
  }
}

function aplicarColoresDinamicos() {
  document.querySelectorAll(".entrenador-card").forEach(card => {
    const color = card.style.getPropertyValue("--disciplina-color");
    card.addEventListener("mouseenter", () => {
      card.style.borderColor = `var(${color.trim().replace("var(","").replace(")","")})`;
    });
    card.addEventListener("mouseleave", () => {
      if (!card.classList.contains("activa")) card.style.borderColor = "transparent";
    });
  });
}

function mostrarEntrenador(i) {
  const e = entrenadores[i];
  seleccionado = i;

  // Actualizar cards
  document.querySelectorAll(".entrenador-card").forEach((c, idx) => {
    const isActiva = idx === i;
    c.classList.toggle("activa", isActiva);
    const colorVar = entrenadores[idx].color;
    c.style.borderColor = isActiva ? `var(${colorVar.replace("var(","").replace(")","")})` : "transparent";
    c.querySelector(".entrenador-avatar").style.borderColor = isActiva
      ? `var(${colorVar.replace("var(","").replace(")","")})` : "transparent";
  });

  // Construir panel
  const panel = document.getElementById("entrenador-panel");
  const colorVar = e.color.replace("var(","").replace(")","");

  const titulosHTML = e.titulos && e.titulos.length
    ? `<div class="panel-bloque">
        <h4>Títulos y logros</h4>
        <ul class="panel-titulos">
          ${e.titulos.map(t => `<li>${t}</li>`).join("")}
        </ul>
       </div>`
    : "";

  const instagramHTML = e.instagram
    ? `<a class="panel-instagram" href="${e.instagram}" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
        @${e.instagram.split("/").filter(Boolean).pop()}
      </a>`
    : "";

  const competidorBadge = e.competidor
    ? `<span class="panel-meta-item">⚔️ <span>Competidor activo</span></span>`
    : `<span class="panel-meta-item">🎓 <span>Entrenador</span></span>`;

  panel.innerHTML = `
    <div class="panel-inner">
      <div class="panel-foto">
        <img src="${e.foto_panel}" alt="Foto de ${e.nombre}"
             onerror="this.onerror=null;this.style.opacity='0'">
        <div class="panel-foto-overlay">
          <div class="panel-foto-nombre">${e.nombre}</div>
          <div class="panel-foto-disciplina" style="color:var(${colorVar})">${e.disciplina}</div>
        </div>
      </div>
      <div class="panel-info">
        <div class="panel-meta">
          <span class="panel-meta-item">📍 <span>${e.origen}</span></span>
          <span class="panel-meta-item">🥋 <span>Practicando desde ${e.desde}</span></span>
          <span class="panel-meta-item">📅 <span>${e.experiencia} años de experiencia enseñando</span></span>
          ${e.edad ? `<span class="panel-meta-item">👤 <span>${e.edad} años</span></span>` : ""}
          ${competidorBadge}
        </div>
        <div class="panel-bloque">
          <h4>Estilo de enseñanza</h4>
          <p>${e.estilo}</p>
        </div>
        <div class="panel-bloque">
          <h4>Historia</h4>
          <p>${e.historia}</p>
        </div>
        <div class="panel-bloque">
          <h4>Tipo de Alumnos</h4>
          <p>${e.alumnos}</p>
        </div>
        ${titulosHTML}
        ${instagramHTML}
      </div>
    </div>
  `;

  panel.classList.add("visible");

  if (window.innerWidth <= 768) {
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

cargarEntrenadores();