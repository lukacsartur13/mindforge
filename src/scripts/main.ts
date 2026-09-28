// ---------- Menü ----------
const menu = document.getElementById('site-menu');
const menuBtn = document.querySelector<HTMLButtonElement>('.site-header__menu-btn');

function setMenu(open: boolean) {
  if (!menu || !menuBtn) return;
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  if (open) menu.querySelector<HTMLElement>('.site-menu__close')?.focus();
  else menuBtn.focus({ preventScroll: true });
}

menuBtn?.addEventListener('click', () => setMenu(true));
menu?.querySelectorAll('[data-menu-close], [data-menu-link]').forEach((el) =>
  el.addEventListener('click', () => setMenu(false)),
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false);
});

// ---------- Fejléc színe világos szekciók fölött ----------
const overlayHeader = document.querySelector<HTMLElement>('.site-header--overlay');
const lightSections = [...document.querySelectorAll<HTMLElement>('[data-header-theme="light"]')];
if (overlayHeader && lightSections.length) {
  let ticking = false;
  const update = () => {
    const y = overlayHeader.offsetHeight / 2;
    const onLight = lightSections.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= y && r.bottom >= y;
    });
    overlayHeader.classList.toggle('is-on-light', onLight);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

// ---------- Diavetítés ----------
document.querySelectorAll<HTMLElement>('[data-slider]').forEach((slider) => {
  const slides = [...slider.querySelectorAll<HTMLElement>('.slide')];
  let index = 0;
  const show = (i: number) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      const active = n === index;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', String(!active));
    });
  };
  slider.querySelector('[data-prev]')?.addEventListener('click', () => show(index - 1));
  slider.querySelector('[data-next]')?.addEventListener('click', () => show(index + 1));
  // A kártyákról közvetlenül a megfelelő diára lehet ugrani (#dia-sportolo stb.)
  document.querySelectorAll<HTMLAnchorElement>('a[data-slide]').forEach((a) =>
    a.addEventListener('click', () => show(Number(a.dataset.slide))),
  );
  show(0);
});

// ---------- Megjelenés animáció ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// ---------- Videók: csak akkor töltődnek, ha a nézetbe érnek ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const videos = document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]');
const loadVideo = (v: HTMLVideoElement) => {
  v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => {
    s.src = s.dataset.src!;
    s.removeAttribute('data-src');
  });
  v.load();
  if (!reduceMotion) v.play().catch(() => {});
};
if ('IntersectionObserver' in window) {
  const vio = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        const v = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          if (v.querySelector('source[data-src]')) loadVideo(v);
          else if (!reduceMotion) v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      }),
    { rootMargin: '200px 0px' },
  );
  videos.forEach((v) => vio.observe(v));
} else {
  videos.forEach(loadVideo);
}

// ---------- Kapcsolati űrlap ----------
document.querySelectorAll<HTMLFormElement>('form[data-contact-form]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('.form__status');
  const endpoint = form.dataset.endpoint;
  const recipient = form.dataset.recipient!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('_gotcha')) return; // spam csapda

    if (!endpoint) {
      // Nincs beállított fogadó szolgáltatás: e-mail kliens megnyitása előtöltve
      const body = [
        `Név: ${data.get('vezeteknev')} ${data.get('keresztnev')}`,
        `E-mail: ${data.get('email')}`,
        `Telefon: ${data.get('telefon') || '-'}`,
        `Lehetséges időpont: ${data.get('idopont') || '-'}`,
        '',
        String(data.get('uzenet') || ''),
      ].join('\n');
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(
        'Ingyenes konzultáció – jelentkezés',
      )}&body=${encodeURIComponent(body)}`;
      return;
    }

    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    btn?.setAttribute('disabled', '');
    if (status) status.textContent = 'Küldés folyamatban…';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      if (status) status.textContent = 'Köszönöm az üzeneted! Hamarosan jelentkezem.';
    } catch {
      if (status)
        status.textContent = `Hiba történt a küldés során. Kérlek írj közvetlenül: ${recipient}`;
    } finally {
      btn?.removeAttribute('disabled');
    }
  });
});
