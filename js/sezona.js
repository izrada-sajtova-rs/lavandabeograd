// Sezonske oznake: data-season="5-6" (prvi i poslednji mesec sezone)
(function () {
  const month = new Date().getMonth() + 1;

  document.querySelectorAll('.season-badge[data-season]').forEach(badge => {
    const [from, to] = badge.getAttribute('data-season').split('-').map(Number);
    const allYear = from === 1 && to === 12;
    const inSeason = from <= to ? (month >= from && month <= to) : (month >= from || month <= to);

    badge.classList.add(inSeason ? 'in-season' : 'off-season');
    if (inSeason && !allYear) {
      badge.textContent = 'Sada u ponudi';
    }
  });

  // Dostupnost u strukturiranim podacima (schema.org) prati sezonu, po adresi ponude
  const offerSeasons = {
    '/#cene': [5, 6], // lavanda
    '/ruzmarin': [1, 12],
    '/majcina-dusica': [5, 9],
    '/nana': [5, 10],
    '/sumske-jagode': [5, 6],
    '/tresnje': [5, 6],
    '/ceri-paradajz': [7, 9]
  };

  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    let data;
    try {
      data = JSON.parse(script.textContent);
    } catch (e) {
      return;
    }

    let changed = false;
    (data['@graph'] || [data]).forEach(item => {
      if (item['@type'] !== 'Product' || !item.offers || !item.offers.url) return;
      const season = offerSeasons[item.offers.url.replace('https://lavandabeograd.com', '')];
      if (!season) return;
      const available = month >= season[0] && month <= season[1];
      item.offers.availability = 'https://schema.org/' + (available ? 'InStock' : 'OutOfStock');
      changed = true;
    });

    if (changed) {
      script.textContent = JSON.stringify(data);
    }
  });

  // Obeležavanje tekućeg meseca u kalendaru sezone (prva ćelija je naziv biljke)
  const headCells = document.querySelectorAll('.season-head span');
  if (headCells[month]) {
    headCells[month].classList.add('now');
  }
})();
