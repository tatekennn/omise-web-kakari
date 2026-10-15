const photoButtons = [...document.querySelectorAll('[data-lightbox]')];

if (photoButtons.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-lightbox';
  dialog.setAttribute('aria-label', '写真の拡大表示');
  dialog.innerHTML = `
    <div class="lightbox-panel">
      <button class="lightbox-close" type="button" aria-label="拡大表示を閉じる">閉じる ×</button>
      <button class="lightbox-nav lightbox-prev" type="button" aria-label="前の写真">←</button>
      <figure>
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="" />
        <figcaption></figcaption>
      </figure>
      <button class="lightbox-nav lightbox-next" type="button" aria-label="次の写真">→</button>
      <p class="lightbox-count" aria-live="polite"></p>
    </div>`;
  document.body.append(dialog);

  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  const count = dialog.querySelector('.lightbox-count');
  const closeButton = dialog.querySelector('.lightbox-close');
  const previousButton = dialog.querySelector('.lightbox-prev');
  const nextButton = dialog.querySelector('.lightbox-next');
  let currentIndex = 0;
  let lastTrigger = null;
  let touchStartX = 0;

  const showPhoto = (index) => {
    currentIndex = (index + photoButtons.length) % photoButtons.length;
    const button = photoButtons[currentIndex];
    const source = button.querySelector('img');
    const label = button.querySelector('.photo-caption')?.textContent?.trim() || source.alt;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    caption.textContent = label;
    count.textContent = `${currentIndex + 1} / ${photoButtons.length}`;
    previousButton.hidden = photoButtons.length < 2;
    nextButton.hidden = photoButtons.length < 2;
  };

  const openPhoto = (index, trigger) => {
    lastTrigger = trigger;
    showPhoto(index);
    document.body.classList.add('lightbox-open');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    closeButton.focus();
  };

  const closePhoto = () => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  photoButtons.forEach((button, index) => {
    button.addEventListener('click', () => openPhoto(index, button));
  });

  closeButton.addEventListener('click', closePhoto);
  previousButton.addEventListener('click', () => showPhoto(currentIndex - 1));
  nextButton.addEventListener('click', () => showPhoto(currentIndex + 1));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closePhoto();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lastTrigger?.focus();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showPhoto(currentIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(currentIndex + 1);
  });
  dialog.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    const distance = (event.changedTouches[0]?.clientX || 0) - touchStartX;
    if (Math.abs(distance) < 45) return;
    showPhoto(currentIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });
}

const reservationDialog = document.querySelector('[data-reservation-dialog]');

if (reservationDialog) {
  const openButtons = [...document.querySelectorAll('[data-reservation-open]')];
  const closeButton = reservationDialog.querySelector('[data-reservation-close]');
  const form = reservationDialog.querySelector('form');
  const formView = reservationDialog.querySelector('[data-reservation-form]');
  const completeView = reservationDialog.querySelector('[data-reservation-complete]');
  let lastTrigger = null;

  const openReservation = (trigger) => {
    lastTrigger = trigger;
    form.reset();
    formView.hidden = false;
    completeView.hidden = true;
    document.body.classList.add('lightbox-open');
    reservationDialog.showModal();
    closeButton.focus();
  };

  const closeReservation = () => reservationDialog.close();

  openButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openReservation(button);
    });
  });
  closeButton.addEventListener('click', closeReservation);
  reservationDialog.addEventListener('click', (event) => {
    if (event.target === reservationDialog) closeReservation();
  });
  reservationDialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lastTrigger?.focus();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    formView.hidden = true;
    completeView.hidden = false;
    completeView.querySelector('button').focus();
  });
  completeView.querySelector('button').addEventListener('click', closeReservation);
}
