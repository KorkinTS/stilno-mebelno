const projects = {
  kitchens: ['Кухни', [
    ['kitchen.jpg', 'Светлая угловая кухня'], ['kitchen-storage.jpg', 'Секция с высокими шкафами'],
    ['kitchen-detail.jpg', 'Фасады и ручки крупным планом'], ['kitchen-after.jpg', 'Кухня после монтажа']
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
      figure.append(item, label);
      return figure;
    }));
    gallery.showModal();
  });
}
gallery.addEventListener('close', () => media.replaceChildren());

document.querySelector('#request-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const output = document.querySelector('#request-text');
  const status = document.querySelector('#request-status');
  const details = data.get('details').trim();
  output.value = ['Здравствуйте! Хочу запросить расчёт мебели.', 'Тип мебели: ' + data.get('product'), details].filter(Boolean).join('\n');
  document.querySelector('#prepared').hidden = false;
  const telegram = document.querySelector('#telegram-draft');
  const destination = new URL('https://t.me/Katy_luckylife');
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
