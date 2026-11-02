(() => {
  if (window.artithmLetterReady) return;
  const dialog = document.getElementById('letter-dialog');
  if (!dialog) return;
  window.artithmLetterReady = true;
  // Keep one dialog outside the sections replaced by the theme's PJAX navigation.
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const message = form.elements.message;
  const contact = form.elements.contact;
  const submit = form.querySelector('[type="submit"]');
  const status = dialog.querySelector('#letter-status');
  const answer = form.elements.challengeAnswer;
  const question = dialog.querySelector('#letter-question');
  const refresh = dialog.querySelector('[data-letter-challenge-refresh]');
  let opener;
  let sending = false;
  let feedbackPending = false;
  let replyTimer;
  let closeTimer;
  let challenge;
  let loadingChallenge;

  const setStatus = (text, state = '') => {
    status.textContent = text || '纸短情长，择心回复。';
    status.dataset.state = state;
  };
  const updateControls = () => {
    const locked = sending || feedbackPending;
    submit.disabled = locked || !challenge;
    refresh.disabled = locked || Boolean(loadingChallenge);
    message.readOnly = locked;
    contact.readOnly = locked;
    answer.readOnly = locked;
  };
  const clearFeedback = () => {
    clearTimeout(replyTimer);
    clearTimeout(closeTimer);
    feedbackPending = false;
    if (!sending) submit.innerHTML = '寄出这封信 <span aria-hidden="true">↗</span>';
  };
  const showFeedback = (text, state, reply = '') => {
    setStatus(text, state);
    if (!dialog.open) return;
    feedbackPending = true;
    updateControls();
    if (reply) replyTimer = setTimeout(() => setStatus(reply, state), 650);
    closeTimer = setTimeout(() => dialog.close(), state === 'success' ? 3400 : 6000);
  };
  const loadChallenge = () => {
    if (loadingChallenge) return loadingChallenge;
    challenge = null;
    submit.disabled = true;
    refresh.disabled = true;
    answer.value = '';
    question.textContent = '正在准备…';
    loadingChallenge = (async () => {
      try {
        const response = await fetch(form.dataset.challengeUrl, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
        const result = await response.json().catch(() => null);
        if (!result || typeof result !== 'object') throw new Error('校验暂时无法加载，请换一题再试。');
        if (!response.ok || !result.token) throw new Error(result.error || '校验暂时无法加载，请换一题再试。');
        challenge = { ...result, loadedAt: Date.now() };
        question.textContent = `${result.a} + ${result.b} =`;
      } catch (error) {
        question.textContent = '未能加载';
        const text = error.name === 'TypeError' || error.name === 'TimeoutError'
          ? '校验连接暂时中断，请换一题再试。'
          : error.message || '校验暂时无法加载，请换一题再试。';
        setStatus(text, 'error');
      } finally {
        loadingChallenge = null;
        updateControls();
      }
    })();
    return loadingChallenge;
  };
  refresh.addEventListener('click', () => { if (!sending && !feedbackPending) { setStatus(''); void loadChallenge(); } });
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-letter-open]');
    if (!trigger) return;
    opener = trigger;
    if (!dialog.open) {
      clearFeedback();
      if (!sending) setStatus('');
      dialog.showModal();
    }
    document.documentElement.classList.add('letter-is-open');
    message.focus({ preventScroll: true });
    if (!sending && !feedbackPending && (!challenge || Date.now() - challenge.loadedAt >= challenge.expiresIn * 1000)) void loadChallenge();
  });
  dialog.querySelector('[data-letter-close]').addEventListener('click', () => dialog.close());
  let backdropStart = false;
  dialog.addEventListener('pointerdown', (event) => { backdropStart = event.target === dialog; });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && backdropStart) dialog.close();
    backdropStart = false;
  });
  dialog.addEventListener('close', () => {
    clearFeedback();
    updateControls();
    document.documentElement.classList.remove('letter-is-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  window.addEventListener('pjax:send', () => { if (dialog.open) dialog.close(); });
  message.addEventListener('input', () => {
    message.setCustomValidity('');
    if (!sending && !feedbackPending) setStatus('');
  });
  contact.addEventListener('input', () => { if (!sending && !feedbackPending) setStatus(''); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || feedbackPending) return;
    if (!challenge || Date.now() - challenge.loadedAt >= challenge.expiresIn * 1000) {
      setStatus('请完成新的一题后再寄出。');
      await loadChallenge();
      answer.focus();
      return;
    }
    const text = message.value.trim();
    const address = contact.value.trim();
    sending = true;
    updateControls();
    form.setAttribute('aria-busy', 'true');
    submit.textContent = '正在寄出…';
    setStatus('正在把你的信放进邮筒……');
    try {
      const wait = Math.max(0, 1500 - (Date.now() - challenge.loadedAt));
      if (wait) await new Promise(resolve => setTimeout(resolve, wait));
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, contact: address, website: form.elements.website.value, requestId: challenge.id, challengeToken: challenge.token, challengeAnswer: answer.value.trim() }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        if (result?.refreshChallenge) challenge = null;
        throw new Error(result?.error || '信暂时没能寄出，请稍后再试。');
      }
      form.reset();
      challenge = null;
      showFeedback('信已寄出。', 'success', text ? '谢谢您的来信，我会认真读。' : '明明什么都没和我说');
    } catch (error) {
      challenge = null;
      const text = error.name === 'TimeoutError' || error.name === 'TypeError'
        ? '寄出结果暂时无法确认，文字已保留；重试可能重复寄出。'
        : error.message;
      showFeedback(text, 'error');
    } finally {
      sending = false;
      form.removeAttribute('aria-busy');
      submit.innerHTML = feedbackPending ? '稍后收起信纸' : '寄出这封信 <span aria-hidden="true">↗</span>';
      updateControls();
    }
  });
})();
