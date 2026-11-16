const projects = {
  kitchens: ['Кухни', [
    ['kitchen.jpg', 'Светлая угловая кухня'], ['kitchen-storage.jpg', 'Секция с высокими шкафами'],
    ['kitchen-detail.jpg', 'Фасады и ручки крупным планом'], ['kitchen-before.jpg', 'До установки кухни'],
    ['kitchen-after.jpg', 'Кухня после монтажа']
  ]],
  storage: ['Шкафы и гардеробные', [
    ['wardrobe.jpg', 'Шкаф со светлыми фасадами'], ['wardrobe-open.jpg', 'Внутреннее наполнение шкафа']
  ]],
  bath: ['Мебель для ванных', [
    ['bathroom.jpg', 'Столешница и мебель вокруг раковины'], ['bathroom-detail.jpg', 'Шкаф в ванной']
  ]],
  interior: ['Прихожие и панели', [
    ['hallway.jpg', 'Мебель в прихожей'], ['panels.jpg', 'Декоративные панели'], ['project-and-result.jpg', 'Эскиз и готовый проект']
  ]],
  business: ['Мебель для бизнеса', [['business.jpg', 'Сравнение дизайн-проекта и готовой мебели для медицинского центра']]],
  video: ['Видео работ', [['overview-1.mp4', 'Обзор работы 1'], ['corner-kitchen-2250.mp4', 'Видеообзор угловой кухни']]]
};

const gallery = document.querySelector('#gallery');
const media = document.querySelector('#gallery-media');
for (const trigger of document.querySelectorAll('[data-project]')) {
  trigger.addEventListener('click', () => {
    const [title, entries] = projects[trigger.dataset.project];
    document.querySelector('#gallery-title').textContent = title;
    media.replaceChildren(...entries.map(([file, caption]) => {
      const figure = document.createElement('figure');
      const isVideo = file.endsWith('.mp4');
      const item = document.createElement(isVideo ? 'video' : 'img');
      item.src = 'assets/' + file;
      if (isVideo) {
        item.controls = true;
        item.preload = 'metadata';
        item.playsInline = true;
        item.setAttribute('aria-label', caption);
      } else {
        item.alt = caption;
      }
      const label = document.createElement('figcaption');
      label.textContent = caption;
      if (isVideo) {
        figure.append(item, label);
      } else {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'photo-trigger';
        button.setAttribute('aria-label', 'Увеличить фото: ' + caption);
        button.append(item);
        button.addEventListener('click', () => openPhotos(media.querySelectorAll('img'), item));
        figure.append(button, label);
      }
      return figure;
    }));
    gallery.showModal();
  });
}
gallery.addEventListener('close', () => media.replaceChildren());

const photoViewer = document.querySelector('#photo-viewer');
const photoScroll = document.querySelector('#photo-scroll');
const fullPhoto = document.querySelector('#photo-full');
const photoPlus = document.querySelector('#photo-plus');
const photoMinus = document.querySelector('#photo-minus');
const photoScale = document.querySelector('#photo-scale');
const photoNavigation = document.querySelector('#photo-navigation');
const previousPhoto = document.querySelector('#photo-previous');
const nextPhoto = document.querySelector('#photo-next');
const photoCount = document.querySelector('#photo-count');
let photos = [];
let photoIndex = 0;
let zoom = 1;

function renderPhoto() {
  const fit = Math.min(photoScroll.clientWidth / fullPhoto.naturalWidth,
    photoScroll.clientHeight / fullPhoto.naturalHeight, 1);
  fullPhoto.width = Math.round(fullPhoto.naturalWidth * fit * zoom);
  fullPhoto.height = Math.round(fullPhoto.naturalHeight * fit * zoom);
  fullPhoto.parentElement.style.padding = zoom > 1
    ? (photoScroll.clientHeight / 2) + 'px ' + (photoScroll.clientWidth / 2) + 'px'
    : '0';
  photoScale.value = Math.round(zoom * 100) + '%';
  photoPlus.disabled = zoom >= 4;
  photoMinus.disabled = zoom <= 1;
}

function showPhoto() {
  const image = photos[photoIndex];
  zoom = 1;
  dragged = false;
  document.querySelector('#photo-title').textContent = image.alt;
  fullPhoto.alt = image.alt;
  photoCount.value = (photoIndex + 1) + ' / ' + photos.length;
  previousPhoto.setAttribute('aria-disabled', String(photoIndex === 0));
  nextPhoto.setAttribute('aria-disabled', String(photoIndex === photos.length - 1));
  fullPhoto.src = image.currentSrc || image.src;
  if (fullPhoto.complete && fullPhoto.naturalWidth) renderPhoto();
  photoScroll.scrollTo(0, 0);
}

function openPhotos(group, selected) {
  photos = Array.from(group);
  photoIndex = photos.indexOf(selected);
  photoNavigation.hidden = photos.length < 2;
  photoViewer.showModal();
  showPhoto();
}

function browsePhoto(step) {
  const index = photoIndex + step;
  if (index < 0 || index >= photos.length) return;
  photoIndex = index;
  showPhoto();
}

function changeZoom(amount, from, to = from) {
  if (!fullPhoto.naturalWidth) return;
  const viewport = photoScroll.getBoundingClientRect();
  const target = from ?? { x: viewport.left + viewport.width / 2, y: viewport.top + viewport.height / 2 };
  const destination = to ?? target;
  const before = fullPhoto.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (target.x - before.left) / before.width));
  const y = Math.max(0, Math.min(1, (target.y - before.top) / before.height));
  zoom = Math.max(1, Math.min(4, zoom + amount));
  renderPhoto();
  const after = fullPhoto.getBoundingClientRect();
  photoScroll.scrollBy(after.left + after.width * x - destination.x,
    after.top + after.height * y - destination.y);
}

function pointerPosition(event) {
  return { x: event.clientX, y: event.clientY };
}

let mouseStart = null;
let dragged = false;
let pinch = null;
let swipeStart = null;

photoScroll.addEventListener('mousedown', event => {
  if (event.button !== 0) return;
  dragged = false;
  mouseStart = pointerPosition(event);
});
window.addEventListener('mousemove', event => {
  if (!mouseStart || zoom <= 1 || !photoViewer.open) return;
  const position = pointerPosition(event);
  const dx = position.x - mouseStart.x;
  const dy = position.y - mouseStart.y;
  if (!dragged && Math.hypot(dx, dy) < 5) return;
  dragged = true;
  photoScroll.scrollBy(-dx, -dy);
  mouseStart = position;
});
window.addEventListener('mouseup', () => { mouseStart = null; });
fullPhoto.addEventListener('click', event => {
  if (!dragged) changeZoom(1, pointerPosition(event));
  dragged = false;
});
photoScroll.addEventListener('wheel', event => {
  if (!event.deltaY) return;
  event.preventDefault();
  changeZoom(event.deltaY < 0 ? 0.25 : -0.25, pointerPosition(event));
}, { passive: false });

function readPinch(touches) {
  const [a, b] = touches;
  return {
    center: { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 },
    distance: Math.max(1, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY))
  };
}

photoScroll.addEventListener('touchstart', event => {
  dragged = false;
  swipeStart = event.touches.length === 1 && zoom === 1 && photos.length > 1
    ? pointerPosition(event.touches[0])
    : null;
  if (event.touches.length !== 2) return;
  event.preventDefault();
  pinch = readPinch(event.touches);
}, { passive: false });
photoScroll.addEventListener('touchmove', event => {
  if (!pinch || event.touches.length !== 2) return;
  event.preventDefault();
  const next = readPinch(event.touches);
  changeZoom(zoom * (next.distance / pinch.distance - 1), pinch.center, next.center);
  pinch = next;
}, { passive: false });
photoScroll.addEventListener('touchend', event => {
  pinch = null;
  if (!swipeStart) return;
  const { x, y } = pointerPosition(event.changedTouches[0]);
  const dx = x - swipeStart.x;
  const dy = y - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) < 45 || Math.abs(dx) <= 1.3 * Math.abs(dy)) return;
  event.preventDefault();
  browsePhoto(dx < 0 ? 1 : -1);
}, { passive: false });
photoScroll.addEventListener('touchcancel', () => {
  pinch = null;
  swipeStart = null;
});

fullPhoto.addEventListener('load', renderPhoto);
photoPlus.addEventListener('click', () => changeZoom(0.5));
photoMinus.addEventListener('click', () => changeZoom(-0.5));
previousPhoto.addEventListener('click', () => browsePhoto(-1));
nextPhoto.addEventListener('click', () => browsePhoto(1));
photoViewer.addEventListener('keydown', event => {
  if (photos.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    browsePhoto(event.key === 'ArrowLeft' ? -1 : 1);
  }
  if (event.key === '+' || event.key === '=' || event.key === '-') {
    event.preventDefault();
    changeZoom(event.key === '-' ? -0.5 : 0.5);
  }
});
window.addEventListener('resize', () => {
  if (photoViewer.open && fullPhoto.naturalWidth) renderPhoto();
});
for (const button of document.querySelectorAll('[data-photo-preview]')) {
  button.addEventListener('click', () => {
    const group = button.closest('.project-stills') ?? button;
    openPhotos(group.querySelectorAll('img'), button.querySelector('img'));
  });
}

document.querySelector('#request-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const output = document.querySelector('#request-text');
  const status = document.querySelector('#request-status');
  const details = data.get('details').trim();
  output.value = ['Здравствуйте! Хочу запросить расчёт мебели.', 'Тип мебели: ' + data.get('product'), details].filter(Boolean).join('\n');
  document.querySelector('#prepared').hidden = false;
  const telegram = document.querySelector('#telegram-draft');
  const destination = new URL('https://t.me/Stilnomebelnoekb');
  destination.searchParams.set('text', output.value);
  telegram.href = destination.href;
  telegram.hidden = false;
  output.focus();
  output.select();
  status.textContent = 'Текст готов. Его можно скопировать из поля.';
  try {
    await navigator.clipboard.writeText(output.value);
    status.textContent = 'Текст заявки скопирован. Можно открыть черновик в Telegram.';
  } catch {
    // The selected text remains available for manual copying.
  }
});

const requestForm = document.querySelector('#request-form');
for (const link of document.querySelectorAll('[data-similar-project]')) {
  link.addEventListener('click', () => {
    const details = requestForm.elements.namedItem('details');
    const project = link.dataset.similarProject;
    const previous = details.value.replace(/^Хочу похожий проект «[^»]+»\.\n?/, '');
    details.value = ['Хочу похожий проект «' + project + '».', previous].filter(Boolean).join('\n');
    const product = requestForm.elements.namedItem('product');
    product.value = project.includes('кухня') || project.startsWith('Кухня') ? 'Кухня' : 'Другое';
    document.querySelector('#prepared').hidden = true;
    document.querySelector('#telegram-draft').hidden = true;
    document.querySelector('#request-status').textContent = '';
  });
}
