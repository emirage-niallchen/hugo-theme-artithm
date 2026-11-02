(() => {
  const pet = document.getElementById('artithm-pet');
  if (!pet || window.artithmPetReady) return;
  window.artithmPetReady = true;
  // Keep one companion outside the theme's PJAX replacement regions.
  document.body.append(pet);
  const touch = pet.querySelector('.artithm-pet-touch');
  const sprite = pet.querySelector('.artithm-pet-sprite');
  const companion = pet.querySelector('.artithm-pet-companion');
  const restore = pet.querySelector('.artithm-pet-restore');
  const peek = restore.querySelector('.artithm-pet-peek');
  const bubble = pet.querySelector('.artithm-pet-bubble');
  const badge = pet.querySelector('.artithm-pet-name');
  const nicknames = JSON.parse(pet.dataset.nicknames || '[]').filter(value => typeof value === 'string' && value.trim());
  const sounds = ['咪呜', '咪嗷', '唔喵', '呼噜呼噜', '哈——', '咕', '嗷呜——', '哇呜——'];
  const sheet = new Image();
  let ready = false;
  let collapsed = false;
  let ticker;
  let bubbleTimer;
  let action;
  let walk;
  let home;
  let nextAmbient = 0;
  let lastAmbient;
  let nicknameIndex = -1;
  let lastSound;
  let drag;
  let gaze;
  let lastFrame;
  let touches = 0;
  let suppressClickUntil = 0;
  const read = (storage, key) => { try { return storage.getItem(key); } catch { return null; } };
  const write = (storage, key, value) => { try { storage.setItem(key, value); } catch {} };
  // Access to the storage getters can itself be denied by browser policy.
  let local;
  let session;
  try { local = window.localStorage; session = window.sessionStorage; } catch {}
  const rename = () => {
    if (!nicknames.length) return;
    // Avoid repeating the current title when there is more than one choice.
    const offset = nicknameIndex < 0 ? 0 : 1;
    const count = nicknames.length - offset;
    nicknameIndex = (Math.max(0, nicknameIndex) + offset + Math.floor(Math.random() * Math.max(1, count))) % nicknames.length;
    badge.textContent = nicknames[nicknameIndex];
    badge.setAttribute('aria-label', `换个称号：${badge.textContent}`);
  };
  const render = (row, frame) => {
    const key = `${row}:${frame}`;
    if (key === lastFrame) return;
    lastFrame = key;
    sprite.style.backgroundPosition = `${frame / 7 * 100}% ${row / (sheet.naturalHeight / 208 - 1) * 100}%`;
  };
  const limit = (value, min, max) => Math.max(min, Math.min(max, value));
  const bounds = () => ({
    x: Math.max(12, innerWidth - pet.offsetWidth - 12),
    y: Math.max(12, innerHeight - pet.offsetHeight - (innerWidth < 768 ? 64 : 20))
  });
  const alignMessages = () => {
    const rect = pet.getBoundingClientRect();
    pet.toggleAttribute('data-bubble-right', rect.x > innerWidth / 2);
    pet.toggleAttribute('data-bubble-below', rect.y < 80);
  };
  const place = (x, y) => {
    const max = bounds();
    pet.style.left = `${limit(x, 12, max.x)}px`;
    pet.style.top = `${limit(y, 12, max.y)}px`;
    pet.style.bottom = 'auto';
    alignMessages();
  };
  const savePosition = () => {
    const rect = pet.getBoundingClientRect();
    home = { x: rect.x, y: rect.y };
    const max = bounds();
    write(session, 'artithm:pet:position', JSON.stringify([rect.x / max.x, rect.y / max.y]));
  };
  const say = () => {
    clearTimeout(bubbleTimer);
    alignMessages();
    const choices = sounds.filter(sound => sound !== lastSound);
    lastSound = choices[Math.floor(Math.random() * choices.length)];
    bubble.textContent = lastSound;
    bubble.hidden = false;
    bubbleTimer = setTimeout(() => { bubble.hidden = true; }, 2000);
  };
  const tick = () => {
    const now = performance.now();
    if (!drag && !action && !walk && now >= nextAmbient && !document.querySelector('dialog[open]')) {
      nextAmbient = now + 2500 + Math.random() * 2500;
      rename();
      say();
      const actions = ['wave', 'walk', 'jump'].filter(kind => kind !== lastAmbient);
      lastAmbient = actions[Math.floor(Math.random() * actions.length)];
      if (lastAmbient === 'walk') {
        const rect = pet.getBoundingClientRect();
        home ||= { x: rect.x, y: rect.y };
        const max = bounds();
        const distance = innerWidth < 768 ? 64 : 100;
        const target = Math.abs(rect.x - home.x) > 16 ? home.x : home.x + (home.x < max.x / 2 ? distance : -distance);
        const to = limit(target, 12, max.x);
        walk = { from: rect.x, to, top: rect.y, start: now, duration: Math.max(500, Math.abs(to - rect.x) / 45 * 1000) };
      } else {
        const jump = lastAmbient === 'jump';
        action = { row: jump ? 4 : 3, frames: jump ? 5 : 4, loops: jump ? 1 : 2, start: now };
      }
    }
    if (drag?.moved) {
      render(drag.direction, Math.floor(now / 100) % 8);
    } else if (walk) {
      const progress = limit((now - walk.start) / walk.duration, 0, 1);
      place(walk.from + (walk.to - walk.from) * progress, walk.top);
      render(walk.to >= walk.from ? 1 : 2, Math.floor(now / 100) % 8);
      if (progress === 1) walk = null;
    } else if (action) {
      const frame = Math.floor((now - action.start) / 140);
      if (frame < action.frames * action.loops) render(action.row, frame % action.frames);
      else { action = null; render(0, 0); }
    } else if (gaze && now - gaze.time < 1400 && sheet.naturalHeight === 2288) {
      render(9 + Math.floor(gaze.frame / 8), gaze.frame % 8);
    } else {
      render(0, Math.floor(now / 240) % 6);
    }
  };
  const syncTicker = () => {
    clearInterval(ticker);
    ticker = undefined;
    if (!ready || collapsed || document.hidden) return;
    tick();
    ticker = setInterval(tick, 100);
  };
  const play = (row, frames, loops = 1) => {
    gaze = null;
    walk = null;
    nextAmbient = performance.now() + 8000;
    action = { row, frames, loops, start: performance.now() };
    tick();
  };
  const setCollapsed = (value, focus = false) => {
    collapsed = value;
    walk = null;
    action = null;
    companion.hidden = value;
    restore.hidden = !value;
    pet.toggleAttribute('data-collapsed', value);
    bubble.hidden = true;
    write(local, 'artithm:pet:collapsed', value ? '1' : '0');
    nextAmbient = performance.now() + 2500;
    if (!value && pet.style.top) { const rect = pet.getBoundingClientRect(); place(rect.x, rect.y); }
    syncTicker();
    if (focus) (value ? restore : touch).focus({ preventScroll: true });
  };
  pet.querySelector('.artithm-pet-hide').addEventListener('click', () => setCollapsed(true, true));
  badge.addEventListener('click', rename);
  for (const trigger of [touch, restore]) {
    trigger.addEventListener('pointerenter', alignMessages);
    trigger.addEventListener('focus', alignMessages);
  }
  restore.addEventListener('click', () => {
    setCollapsed(false, true);
    play(3, 4, 2);
    say();
  });
  touch.addEventListener('click', () => {
    if (performance.now() < suppressClickUntil) return;
    touches++;
    rename();
    play(touches % 2 ? 3 : 4, touches % 2 ? 4 : 5, touches % 2 ? 2 : 1);
    say();
  });
  touch.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    walk = null;
    nextAmbient = performance.now() + 10000;
    const rect = pet.getBoundingClientRect();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.x, top: rect.y, moved: false, direction: 1 };
    touch.setPointerCapture(event.pointerId);
  });
  // Continue across the page even if the browser releases pointer capture.
  window.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    if (event.movementX) drag.direction = event.movementX < 0 ? 2 : 1;
    pet.setAttribute('data-dragging', '');
    bubble.hidden = true;
    action = null;
    place(drag.left + dx, drag.top + dy);
    tick();
  });
  const drop = event => {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved;
    drag = null;
    pet.removeAttribute('data-dragging');
    if (touch.hasPointerCapture(event.pointerId)) touch.releasePointerCapture(event.pointerId);
    if (moved) {
      suppressClickUntil = performance.now() + 400;
      savePosition();
      if (event.type === 'pointerup') play(4, 5);
    }
  };
  window.addEventListener('pointerup', drop);
  window.addEventListener('pointercancel', drop);
  window.addEventListener('blur', () => {
    if (drag) drop({ pointerId: drag.id, type: 'pointercancel' });
  });
  touch.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setCollapsed(true, true); return; }
    const direction = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[event.key];
    if (!direction) return;
    event.preventDefault();
    walk = null;
    nextAmbient = performance.now() + 10000;
    const rect = pet.getBoundingClientRect();
    place(rect.x + direction[0], rect.y + direction[1]);
    savePosition();
  });
  document.addEventListener('pointermove', event => {
    if (!ready || collapsed || drag || event.pointerType !== 'mouse') return;
    const rect = sprite.getBoundingClientRect();
    const dx = event.clientX - (rect.x + rect.width / 2);
    const dy = event.clientY - (rect.y + rect.height * .35);
    if (Math.hypot(dx, dy) < 35) { gaze = null; return; }
    const angle = Math.atan2(dx, -dy);
    gaze = { frame: (Math.round(angle / (Math.PI / 8)) + 16) % 16, time: performance.now() };
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!ready || collapsed || !pet.style.top) return;
    walk = null;
    const rect = pet.getBoundingClientRect();
    place(rect.x, rect.y);
    if (home) { const max = bounds(); home.x = limit(home.x, 12, max.x); home.y = limit(home.y, 12, max.y); }
  });
  document.addEventListener('visibilitychange', () => {
    walk = null;
    nextAmbient = performance.now() + 2500;
    syncTicker();
  });
  sheet.onload = () => {
    if (sheet.naturalWidth !== 1536 || ![1872, 2288].includes(sheet.naturalHeight)) return;
    for (const image of [sprite, peek]) {
      image.style.backgroundImage = `url("${sheet.src}")`;
      image.style.backgroundSize = `800% ${sheet.naturalHeight / 208 * 100}%`;
    }
    ready = true;
    rename();
    pet.hidden = false;
    try {
      const position = JSON.parse(read(session, 'artithm:pet:position'));
      if (Array.isArray(position) && position.length === 2 && position.every(Number.isFinite)) {
        const max = bounds();
        place(position[0] * max.x, position[1] * max.y);
      }
    } catch {}
    setCollapsed(read(local, 'artithm:pet:collapsed') === '1');
    if (!collapsed) {
      nextAmbient = performance.now() + 2500;
      say();
    }
  };
  sheet.src = pet.dataset.spritesheet;
})();
