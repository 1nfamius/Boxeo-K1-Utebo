// Flip táctil para móvil — añadir al final de combates.js o incluir como script aparte
document.querySelectorAll(".disciplina-flip").forEach(card => {
  card.addEventListener("click", () => {
    // Solo actuar en táctil (sin hover disponible)
    if (window.matchMedia("(hover: none)").matches) {
      card.classList.toggle("flipped");
    }
  });
});