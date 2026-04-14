/**
 * hamburger.js — Boxeo K1 Utebo
 * Menú hamburger para móvil. Estandarizado para todas las páginas.
 * Incluir con <script src="/js/hamburger.js" defer></script> en el <head>
 */

(function () {
  const btn    = document.getElementById('hamburger-btn');
  const menu   = document.getElementById('nav-mobile');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
    menu.setAttribute('aria-hidden', !isOpen);
  });

  // Cerrar al hacer click en cualquier enlace del menú móvil
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    });
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      btn.focus();
    }
  });
})();