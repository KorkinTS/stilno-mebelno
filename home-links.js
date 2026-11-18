const movedSections = new Map([
  ['#projects', 'projects.html'],
  ['#before-after', 'projects.html'],
  ['#cases', 'projects.html'],
  ['#cases-title', 'projects.html'],
  ['#corner-kitchen', 'projects.html'],
  ['#graphite-vanity', 'projects.html'],
  ['#three-sided-kitchen', 'projects.html'],
  ['#video-projects', 'projects.html'],
  ['#reviews', 'projects.html'],
  ['#story', 'about.html'],
  ['#team', 'about.html'],
  ['#process', 'order.html'],
  ['#order-rates', 'order.html'],
  ['#measurement', 'order.html'],
  ['#faq', 'order.html'],
  ['#contact', 'order.html']
]);

function followMovedSection() {
  const page = movedSections.get(location.hash);
  if (page) location.replace(page + location.search + location.hash);
}

followMovedSection();
window.addEventListener('hashchange', followMovedSection);
