document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.code-copy');
  if (!btn) return;
  try { await navigator.clipboard.writeText(btn.closest('.code').querySelector('pre').innerText); } catch { return; }
  btn.textContent = 'Copied';
  btn.classList.add('done');
  setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1600);
});
