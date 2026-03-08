let indiceCarrusel = 0;
let indiceLight    = 0;
let autoplay       = null;
let fotos          = [];

async function cargarInstalaciones() {
  const res = await fetch("/data/instalaciones.json");
  fotos = await res.json();

  if (!fotos.length) return;

  const track   = document.getElementById("carrusel-track");
  const dots    = document.getElementById("carrusel-dots");
  const minGrid = document.getElementById("miniaturas-grid");

  // ── Construir slides, dots y miniaturas ──
  fotos.forEach((f, i) => {

    // Slide
    const slide = document.createElement("div");
    slide.classList.add("carrusel-slide");
    slide.innerHTML = `
      <img data-src="${f.src}" alt="${f.alt}">
      <div class="carrusel-slide-caption">${f.alt}</div>
      <span class="zoom-hint">🔍 Ampliar</span>
    `;
    slide.addEventListener("click", () => abrirLight(i));
    track.appendChild(slide);

    // Dot
    const dot = document.createElement("button");
    dot.classList.add("dot");
    dot.setAttribute("aria-label", `Ir a foto ${i + 1}`);
    dot.addEventListener("click", () => irA(i));
    dots.appendChild(dot);

    // Miniatura
    const min = document.createElement("div");
    min.classList.add("miniatura");
    min.innerHTML = `<img src="${f.src}" alt="${f.alt}" loading="lazy">`;
    min.addEventListener("click", () => { irA(i); abrirLight(i); });
    minGrid.appendChild(min);
  });

  // ── Navegación carrusel ──
  document.getElementById("btn-prev").addEventListener("click", () => irA(indiceCarrusel - 1));
  document.getElementById("btn-next").addEventListener("click", () => irA(indiceCarrusel + 1));

  // ── Autoplay (pausa en hover) ──
  const wrapper = document.getElementById("carrusel-wrapper");
  iniciarAutoplay();
  wrapper.addEventListener("mouseenter", () => clearInterval(autoplay));
  wrapper.addEventListener("mouseleave", iniciarAutoplay);

  // ── Swipe táctil ──
  let touchStartX = 0;
  track.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; });
  track.addEventListener("touchend",   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) irA(indiceCarrusel + (diff > 0 ? 1 : -1));
  });

  // ── Lightbox ──
  document.getElementById("lb-cerrar").addEventListener("click", cerrarLight);
  document.getElementById("lb-prev").addEventListener("click", () => navLight(-1));
  document.getElementById("lb-next").addEventListener("click", () => navLight(1));

  document.getElementById("lightbox").addEventListener("click", e => {
    if (e.target === document.getElementById("lightbox")) cerrarLight();
  });

  document.addEventListener("keydown", e => {
    if (!document.getElementById("lightbox").classList.contains("abierto")) return;
    if (e.key === "Escape")      cerrarLight();
    if (e.key === "ArrowLeft")   navLight(-1);
    if (e.key === "ArrowRight")  navLight(1);
  });

  // ── Init: cargar solo primera foto y su vecina ──
  cargarFoto(0);
  cargarFoto(1);
  actualizarUI();
}

// ── Lazy loading: carga src solo cuando toca ──
function cargarFoto(i) {
  const idx = (i + fotos.length) % fotos.length;
  const imgs = document.getElementById("carrusel-track").querySelectorAll("img");
  const img = imgs[idx];
  if (img && !img.src) img.src = img.dataset.src;
}

// ── Carrusel ──
function irA(i) {
  indiceCarrusel = (i + fotos.length) % fotos.length;
  document.getElementById("carrusel-track").style.transform =
    `translateX(-${indiceCarrusel * 100}%)`;
  cargarFoto(indiceCarrusel);       // foto activa
  cargarFoto(indiceCarrusel + 1);   // siguiente (precarga)
  cargarFoto(indiceCarrusel - 1);   // anterior (precarga)
  actualizarUI();
}

function actualizarUI() {
  document.querySelectorAll(".dot").forEach((d, i) =>
    d.classList.toggle("activo", i === indiceCarrusel));
  document.querySelectorAll(".miniatura").forEach((m, i) =>
    m.classList.toggle("activa", i === indiceCarrusel));
  document.getElementById("carrusel-counter").textContent =
    `${indiceCarrusel + 1} / ${fotos.length}`;
}

function iniciarAutoplay() {
  autoplay = setInterval(() => irA(indiceCarrusel + 1), 5000);
}

// ── Lightbox ──
function abrirLight(i) {
  indiceLight = i;
  renderLight();
  document.getElementById("lightbox").classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function cerrarLight() {
  document.getElementById("lightbox").classList.remove("abierto");
  document.body.style.overflow = "";
}

function navLight(dir) {
  indiceLight = (indiceLight + dir + fotos.length) % fotos.length;
  renderLight();
}

function renderLight() {
  const f = fotos[indiceLight];
  const lbImg = document.getElementById("lightbox-img");

  // Mostrar placeholder mientras carga
  lbImg.style.opacity = "0";
  lbImg.onload = () => { lbImg.style.opacity = "1"; };
  lbImg.style.transition = "opacity 0.25s";

  lbImg.src = f.src;
  lbImg.alt = f.alt;
  document.getElementById("lightbox-caption").textContent = f.alt;
  document.getElementById("lightbox-counter").textContent =
    `${indiceLight + 1} / ${fotos.length}`;
}

cargarInstalaciones();