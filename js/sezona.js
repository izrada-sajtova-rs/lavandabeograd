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

  // Obeležavanje tekućeg meseca u kalendaru sezone (prva ćelija je naziv biljke)
  const headCells = document.querySelectorAll('.season-head span');
  if (headCells[month]) {
    headCells[month].classList.add('now');
  }
})();
