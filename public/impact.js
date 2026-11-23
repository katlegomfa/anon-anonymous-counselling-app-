(() => {
  const status = document.querySelector('#impactDataStatus');
  const note = document.querySelector('#impactDataNote');
  const cards = document.querySelector('#impactProgrammeCards');

  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  async function loadPublicSummary() {
    if (!cards) return;
    try {
      const response = await fetch('/data/gabs-impact.json', {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Public summary could not be loaded.');
      const data = await response.json();
      if (data.numerical_impact_figures_published !== false ||
          data.publication_status !== 'awaiting_written_gabs_approval' ||
          !Array.isArray(data.programmes) || data.programmes.length !== 3) {
        throw new Error('Public summary does not meet the publication policy.');
      }
      cards.innerHTML = data.programmes.map(programme =>
        '<article><span>GABS CORE PROGRAMME</span><h3>' + escapeHTML(programme.title) +
        '</h3><p>' + escapeHTML(programme.summary) + '</p></article>'
      ).join('');
      if (status) status.textContent = 'Detailed numerical impact figures remain unpublished pending GABS authorisation.';
      if (note) note.textContent = data.disclosure_note;
    } catch (error) {
      if (status) status.textContent = 'Programme summary unavailable.';
      if (note) note.textContent = 'No numerical figures are displayed. Please check the application deployment.';
    }
  }

  loadPublicSummary();
})();
