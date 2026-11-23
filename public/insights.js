(() => {
  const menuToggle = document.querySelector('#menuToggle');
  const nav = document.querySelector('.top nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const search = document.querySelector('#knowledgeSearch');
  const cards = [...document.querySelectorAll('.knowledge-card')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const empty = document.querySelector('#knowledgeEmpty');
  let activeFilter = 'all';
  function applyKnowledgeFilter() {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const categoryMatch = activeFilter === 'all' || (card.dataset.topic || '').split(/\\s+/).includes(activeFilter);
      const searchMatch = !query || ((card.dataset.search || '') + ' ' + card.textContent).toLowerCase().includes(query);
      const show = categoryMatch && searchMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  }
  if (search) search.addEventListener('input', applyKnowledgeFilter);
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter || 'all';
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    applyKnowledgeFilter();
  }));

  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const selected = tab.dataset.tab;
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== selected; });
  }));
})();