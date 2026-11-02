(() => {
  if (window.artithmContactReady) return;
  const dialog = document.getElementById('contact-dialog');
  if (!dialog) return;
  window.artithmContactReady = true;
  // Keep one dialog through the theme's PJAX page changes.
  document.body.append(dialog);
  const cards = [...dialog.querySelectorAll('[data-contact-card]')];
  const status = dialog.querySelector('.contact-status');
  let opener;

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-contact-open]');
    if (!trigger) return;
    const card = cards.find(item => item.dataset.contactCard === trigger.dataset.contactOpen);
    if (!card) return;
    opener = trigger;
    cards.forEach(item => { item.hidden = item !== card; });
    status.textContent = '';
    dialog.setAttribute('aria-labelledby', card.querySelector('h2').id);
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('contact-is-open');
  });

  dialog.querySelector('[data-contact-close]').addEventListener('click', () => dialog.close());
  let backdropStart = false;
  dialog.addEventListener('pointerdown', (event) => { backdropStart = event.target === dialog; });
  dialog.addEventListener('click', async (event) => {
    if (event.target === dialog && backdropStart) dialog.close();
    backdropStart = false;
    const copy = event.target.closest('[data-contact-copy]');
    if (!copy) return;
    const activeCard = copy.closest('[data-contact-card]');
    try {
      await navigator.clipboard.writeText(copy.dataset.contactCopy);
      if (dialog.open && !activeCard.hidden) status.textContent = '账号已复制。';
    } catch {
      if (!dialog.open || activeCard.hidden) return;
      // Selection also works when clipboard permission is unavailable.
      const account = activeCard.querySelector('.contact-account');
      const range = document.createRange();
      range.selectNodeContents(account);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      account.focus({ preventScroll: true });
      status.textContent = '账号已选中，请复制或长按复制。';
    }
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('contact-is-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  window.addEventListener('pjax:send', () => { if (dialog.open) dialog.close(); });
})();
