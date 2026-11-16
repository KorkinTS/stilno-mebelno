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
  video: ['Видео работ', [['overview-1.mp4', 'Обзор работы 1'], ['overview-2.mp4', 'Обзор работы 2']]]
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
        button.addEventListener('click', () => openPhoto(item));
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
let zoom = 1;

function renderPhoto() {
  const fit = Math.min(photoScroll.clientWidth / fullPhoto.naturalWidth,
    photoScroll.clientHeight / fullPhoto.naturalHeight, 1);
  fullPhoto.width = Math.round(fullPhoto.naturalWidth * fit * zoom);
  fullPhoto.height = Math.round(fullPhoto.naturalHeight * fit * zoom);
  photoScale.value = Math.round(zoom * 100) + '%';
  photoPlus.disabled = zoom >= 4;
  photoMinus.disabled = zoom <= 1;
}

function openPhoto(image) {
  zoom = 1;
  document.querySelector('#photo-title').textContent = image.alt;
  fullPhoto.alt = image.alt;
  photoViewer.showModal();
  fullPhoto.src = image.currentSrc || image.src;
  if (fullPhoto.complete && fullPhoto.naturalWidth) renderPhoto();
  photoScroll.scrollTo(0, 0);
}

function changeZoom(amount) {
  if (!fullPhoto.naturalWidth) return;
  const previousZoom = zoom;
  const stage = fullPhoto.parentElement;
  const x = (photoScroll.scrollLeft + photoScroll.clientWidth / 2 - (stage.offsetWidth - fullPhoto.width) / 2) / previousZoom;
  const y = (photoScroll.scrollTop + photoScroll.clientHeight / 2 - (stage.offsetHeight - fullPhoto.height) / 2) / previousZoom;
  zoom = Math.max(1, Math.min(4, zoom + amount));
  renderPhoto();
  photoScroll.scrollTo(x * zoom + (stage.offsetWidth - fullPhoto.width) / 2 - photoScroll.clientWidth / 2,
    y * zoom + (stage.offsetHeight - fullPhoto.height) / 2 - photoScroll.clientHeight / 2);
}

fullPhoto.addEventListener('load', renderPhoto);
photoPlus.addEventListener('click', () => changeZoom(0.5));
photoMinus.addEventListener('click', () => changeZoom(-0.5));
photoViewer.addEventListener('keydown', event => {
  if (event.key === '+' || event.key === '=' || event.key === '-') {
    event.preventDefault();
    changeZoom(event.key === '-' ? -0.5 : 0.5);
  }
});
window.addEventListener('resize', () => {
  if (photoViewer.open && fullPhoto.naturalWidth) renderPhoto();
});
for (const button of document.querySelectorAll('[data-photo-preview]')) {
  button.addEventListener('click', () => openPhoto(button.querySelector('img')));
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
