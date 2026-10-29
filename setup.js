(() => {
  'use strict';
  const photos = [];
  let proposal = null;
  const status = document.getElementById('setup-status');
  const editor = document.getElementById('photo-editor');
  const captions = ['My favourite place is next to you.', 'The little things. The best things.', 'Here’s to our beginning.'];
  const say = (message, error = false) => { status.textContent = message; status.classList.toggle('error', error); };
  function renderPhotos() {
    editor.replaceChildren();
    document.getElementById('selected-count').textContent = photos.length ? `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} selected` : 'No photos selected';
    photos.forEach((photo, i) => {
      const card = document.createElement('div'); card.className = 'editor-card';
      const img = document.createElement('img'); img.src = photo.url; img.alt = `Selected photo ${i + 1}`;
      const caption = document.createElement('input'); caption.value = photo.caption; caption.maxLength = 120; caption.setAttribute('aria-label', `Caption for photo ${i + 1}`);
      caption.addEventListener('input', () => photo.caption = caption.value);
      const actions = document.createElement('div'); actions.className = 'card-actions';
      const left = document.createElement('button'); left.textContent = '←'; left.disabled = i === 0; left.setAttribute('aria-label', `Move photo ${i + 1} earlier`);
      left.onclick = () => { [photos[i - 1], photos[i]] = [photos[i], photos[i - 1]]; renderPhotos(); };
      const right = document.createElement('button'); right.textContent = '→'; right.disabled = i === photos.length - 1; right.setAttribute('aria-label', `Move photo ${i + 1} later`);
      right.onclick = () => { [photos[i + 1], photos[i]] = [photos[i], photos[i + 1]]; renderPhotos(); };
      const remove = document.createElement('button'); remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove photo ${i + 1}`);
      remove.onclick = () => { URL.revokeObjectURL(photo.url); photos.splice(i, 1); renderPhotos(); };
      actions.append(left, right, remove); card.append(img, caption, actions); editor.append(card);
    });
  }
  document.getElementById('photos-input').addEventListener('change', event => {
    let rejected = false;
    for (const file of event.target.files) {
      if (!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)) { rejected = true; continue; }
      photos.push({ file, url: URL.createObjectURL(file), caption: captions[photos.length % captions.length] });
    }
    event.target.value = ''; renderPhotos();
    say(rejected ? 'Some files were skipped. Use JPG, PNG, WebP or AVIF images.' : 'Photos added. You can change the order and captions below.', rejected);
  });
  const videoElement = document.getElementById('setup-video');
  document.getElementById('video-input').addEventListener('change', event => {
    const file = event.target.files[0]; if (!file) return;
    if (!['video/mp4','video/webm','video/quicktime'].includes(file.type)) { say('Please choose an MP4, WebM or MOV video.', true); return; }
    if (proposal) URL.revokeObjectURL(proposal.url);
    proposal = { file, url: URL.createObjectURL(file) };
    videoElement.src = proposal.url;
    document.getElementById('video-selection').hidden = false;
    document.getElementById('video-filename').textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    say('Your proposal video is added. Check that it plays before downloading.');
    event.target.value = '';
  });
  videoElement.addEventListener('error', () => say('This browser cannot play that video. Convert it to MP4 (H.264 video + AAC audio) for the widest support.', true));
  document.getElementById('remove-video').addEventListener('click', () => {
    videoElement.pause(); videoElement.removeAttribute('src'); videoElement.load();
    if (proposal) URL.revokeObjectURL(proposal.url); proposal = null;
    document.getElementById('video-selection').hidden = true; say('Video removed.');
  });
  document.getElementById('preview-button').addEventListener('click', () => {
    const preview = { photos: photos.map(photo => ({ src: photo.url, caption: photo.caption, position: photo.position })), video: proposal?.url || '' };
    try { sessionStorage.setItem('love-preview', JSON.stringify(preview)); }
    catch { say('Your browser blocked preview storage. Allow session storage or download the ZIP to preview locally.', true); return; }
    window.open('index.html?preview=1', '_blank');
    say('Preview opened. Keep this setup page open so your media can play.');
  });
  function extension(file) {
    const byType = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
    return byType[file.type] || 'bin';
  }
  document.getElementById('download-button').addEventListener('click', async event => {
    if (!photos.length || !proposal) { say('Add at least one photo and your proposal video first. Your letter is already included.', true); return; }
    const totalSize = photos.reduce((sum, photo) => sum + photo.file.size, proposal.file.size);
    if (totalSize > 250 * 1024 * 1024) { say('Your media is over 250 MB. Export a smaller MP4 or resize the photos, then try again. You can also add media manually using the README.', true); return; }
    const button = event.currentTarget; button.disabled = true; say('Putting your memories together… This may take a moment.');
    try {
      const entries = [];
      const config = { photos: [], video: '', videoPoster: '' };
      for (let i = 0; i < photos.length; i++) {
        const name = `assets/photo-${i + 1}.${extension(photos[i].file)}`;
        config.photos.push({ src: name, caption: photos[i].caption, position: photos[i].position }); entries.push({ name, data: photos[i].file });
      }
      config.video = `assets/proposal.${extension(proposal.file)}`;
      entries.push({ name: config.video, data: proposal.file });
      const names = ['index.html', 'styles.css', 'app.js', 'assets/sunflower.svg', 'setup.html', 'setup.css', 'setup.js', 'zip.js', 'vercel.json', 'robots.txt', 'README.md'];
      for (const name of names) {
        const response = await fetch(name); if (!response.ok) throw new Error(`Could not load ${name}.`);
        entries.push({ name, data: await response.blob() });
      }
      entries.push({ name: 'config.js', data: new Blob(['window.LOVE_CONFIG = ', JSON.stringify(config, null, 2), ';\n']) });
      // Let the progress text paint before CRC calculation for larger videos.
      await new Promise(resolve => setTimeout(resolve, 30));
      const zip = await window.makeLoveZip(entries);
      const url = URL.createObjectURL(zip), link = document.createElement('a');
      link.href = url; link.download = 'our-little-beginning.zip'; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      say('Your ZIP is ready and the download has started. Extract it, then follow the Vercel steps below. 🌻');
    } catch (error) { say('Could not make the ZIP. Open this page through a local web server (instructions in README.md) and try again. ' + error.message, true); }
    finally { button.disabled = false; }
  });
  // Keep the photographs already supplied with this site when adding the video.
  async function loadIncludedMedia() {
    const saved = window.LOVE_CONFIG || {};
    const included = Array.isArray(saved.photos) ? saved.photos : [];
    if (!included.length && !saved.video) return;
    const controls = document.querySelectorAll('input[type="file"], #preview-button, #download-button');
    controls.forEach(control => control.disabled = true);
    say('Loading your included photographs…');
    const loadFile = async src => {
      const response = await fetch(src);
      if (!response.ok) throw new Error('Could not load ' + src);
      const blob = await response.blob();
      return new File([blob], src.split('/').pop(), { type: blob.type });
    };
    let failed = 0;
    for (const entry of included) {
      try {
        const file = await loadFile(entry.src);
        photos.push({ file, url: URL.createObjectURL(file), caption: entry.caption || '', position: entry.position });
      } catch { failed++; }
    }
    if (saved.video) {
      try {
        const file = await loadFile(saved.video);
        proposal = { file, url: URL.createObjectURL(file) };
        videoElement.src = proposal.url;
        document.getElementById('video-selection').hidden = false;
        document.getElementById('video-filename').textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
      } catch { failed++; }
    }
    renderPhotos();
    controls.forEach(control => control.disabled = false);
    say(failed ? 'Some included media could not load. Open this page using the local server in README.md, or select those files again.' : (saved.video ? 'Your photos and proposal video are ready. Preview your story or export the website. 🌻' : 'Your included photos are ready. Add your proposal video whenever you’re ready. 🌻'), failed > 0);
  }
  loadIncludedMedia();
})();
