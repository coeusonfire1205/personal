(() => {
  'use strict';
  let config = window.LOVE_CONFIG || {};
  if (new URLSearchParams(location.search).get('preview') === '1') {
    try { config = JSON.parse(sessionStorage.getItem('love-preview') || 'null') || config; } catch { /* Use file configuration if preview storage is unavailable. */ }
  }
  const chapters = ['memories', 'proposal', 'sunflower', 'letter'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const video = document.getElementById('proposal-video');
  const bloom = document.getElementById('bloom-button');
  let bloomTimer;
  function goTo(id, updateHistory = true, moveFocus = true) {
    if (!chapters.includes(id)) id = 'memories';
    clearTimeout(bloomTimer);
    bloom.disabled = false;
    bloom.classList.remove('blooming');
    if (id !== 'proposal') video.pause();
    for (const chapter of chapters) document.getElementById(chapter).hidden = chapter !== id;
    document.querySelectorAll('.page-footer nav button').forEach(button => {
      if (button.dataset.go === (id === 'letter' ? 'sunflower' : id)) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    if (updateHistory && location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (moveFocus) document.getElementById(id).querySelector('h1').focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => goTo(button.dataset.go)));
  document.querySelector('.wordmark').addEventListener('click', event => { event.preventDefault(); goTo('memories'); });
  window.addEventListener('popstate', () => goTo(location.hash.slice(1), false));
  window.addEventListener('hashchange', () => goTo(location.hash.slice(1), false));
  // Put the next action after the photographs on phones.
  const mobileNext = document.querySelector('.memory-copy .button').cloneNode(true);
  mobileNext.classList.add('mobile-next');
  mobileNext.addEventListener('click', () => goTo('proposal'));
  document.querySelector('.memories').appendChild(mobileNext);
  const mobileCSS = document.createElement('style');
  mobileCSS.textContent = '@media(min-width:701px){.mobile-next{display:none}}';
  document.head.appendChild(mobileCSS);

  const defaults = ['My favourite place is next to you.', 'The little things. The best things.', 'Here’s to our beginning.'];
  const suppliedPhotos = Array.isArray(config.photos) ? config.photos.filter(photo => photo && typeof photo.src === 'string' && photo.src.trim()) : [];
  const photos = suppliedPhotos.length ? suppliedPhotos : defaults.map((caption, index) => ({ src: '', caption, placeholder: index }));
  let photoIndex = 0;
  const gallery = document.getElementById('gallery');
  const dialog = document.getElementById('photo-dialog');
  function showPhoto(photo) {
    if (!photo.src) { location.href = 'setup.html'; return; }
    const full = document.getElementById('full-photo');
    full.src = photo.src;
    full.alt = photo.caption || 'A photograph of us';
    document.getElementById('full-caption').textContent = photo.caption || '';
    dialog.showModal();
  }
  function drawPhotos() {
    gallery.replaceChildren();
    const visibleCount = Math.min(3, photos.length);
    for (let i = 0; i < visibleCount; i++) {
      const photo = photos[(photoIndex + i) % photos.length];
      const figure = document.createElement('figure');
      figure.className = 'polaroid';
      const button = document.createElement('button');
      button.className = 'photo-open';
      button.setAttribute('aria-label', photo.src ? 'View photograph: ' + (photo.caption || 'Us together') : 'Add your photographs');
      if (photo.src) {
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.caption || 'Us together';
        if (photo.position) img.style.objectPosition = photo.position;
        img.decoding = 'async';
        img.addEventListener('error', () => {
          button.replaceChildren(placeholder(i, 'Photo unavailable'));
        }, { once: true });
        button.append(img);
      } else button.append(placeholder(i, 'Your photo goes here'));
      button.addEventListener('click', () => showPhoto(photo));
      const caption = document.createElement('figcaption');
      caption.textContent = photo.caption || defaults[i];
      figure.append(button, caption);
      gallery.append(figure);
    }
    // Centre a single supplied image without inventing additional photos.
    gallery.style.transform = photos.length === 1 ? 'translate(16%, 10%)' : '';
    document.getElementById('photo-count').textContent = `${String(photoIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    document.getElementById('prev-photo').disabled = photos.length <= 3;
    document.getElementById('next-photo').disabled = photos.length <= 3;
  }
  function placeholder(i, label) {
    const wrap = document.createElement('div');
    wrap.className = 'photo-placeholder';
    if (i === 1) {
      const img = document.createElement('img'); img.src = 'assets/sunflower.svg'; img.alt = ''; wrap.append(img);
    } else { const icon = document.createElement('b'); icon.textContent = i === 0 ? '♡' : '☀'; wrap.append(icon); }
    const text = document.createElement('span'); text.textContent = label; wrap.append(text);
    return wrap;
  }
  document.getElementById('prev-photo').addEventListener('click', () => { photoIndex = (photoIndex - 1 + photos.length) % photos.length; drawPhotos(); });
  document.getElementById('next-photo').addEventListener('click', () => { photoIndex = (photoIndex + 1) % photos.length; drawPhotos(); });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  drawPhotos();
  if (typeof config.video === 'string' && config.video.trim()) {
    video.src = config.video;
    if (config.videoPoster) video.poster = config.videoPoster;
    video.hidden = false;
    document.getElementById('video-empty').hidden = true;
    video.addEventListener('error', () => {
      video.hidden = true;
      const empty = document.getElementById('video-empty');
      empty.hidden = false;
      empty.querySelector('.missing-media').textContent = 'This video could not load. Check the video file and use an MP4 with H.264 video and AAC audio.';
    });
  }
  const petalGroup = document.getElementById('flower-petals');
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < 16; i++) {
      const petal = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      petal.setAttribute('d', ring ? 'M-9 -28 C-27 -62 -17 -101 0 -113 C17 -101 27 -62 9 -28Z' : 'M-10 -31 C-32 -76 -20 -117 0 -130 C20 -117 32 -76 10 -31Z');
      petal.setAttribute('fill', 'url(#petalGold)');
      petal.setAttribute('stroke', '#c4963c');
      petal.setAttribute('stroke-width', '.5');
      petal.classList.add('flower-petal');
      petal.style.setProperty('--angle', (i * 22.5 + ring * 11.25) + 'deg');
      petalGroup.append(petal);
    }
  }
  function shower() {
    if (reduceMotion) return;
    const container = document.getElementById('petal-shower');
    container.replaceChildren();
    for (let i = 0; i < 27; i++) {
      const petal = document.createElement('i'); petal.className = 'falling-petal';
      petal.style.setProperty('--left', Math.random() * 100 + '%');
      petal.style.setProperty('--delay', Math.random() * 1.5 + 's');
      petal.style.setProperty('--duration', (Math.random() * 2 + 3) + 's');
      container.append(petal);
    }
    setTimeout(() => container.replaceChildren(), 7000);
  }
  bloom.addEventListener('click', () => {
    bloom.disabled = true;
    bloom.classList.add('blooming');
    shower();
    bloomTimer = setTimeout(() => goTo('letter'), reduceMotion ? 0 : 1600);
  });
  goTo(location.hash.slice(1) || 'memories', false, false);
})();
