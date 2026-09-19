/* Native details remains usable without JavaScript. */
(() => {
  const menus = Array.from(document.querySelectorAll('.mobile-site-menu'));
  const desktop = matchMedia('(min-width: 901px)');
  menus.forEach(menu => {
    menu.addEventListener('click', event => {
      if (event.target.closest('nav a')) menu.open = false;
    });
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
  });
  document.addEventListener('click', event => {
    menus.forEach(menu => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  });
  desktop.addEventListener('change', event => {
    if (event.matches) menus.forEach(menu => { menu.open = false; });
  });
})();
