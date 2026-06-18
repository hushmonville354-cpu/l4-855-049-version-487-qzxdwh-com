(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = 0;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    const play = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    if (slides.length > 1) {
      prev?.addEventListener('click', () => {
        show(index - 1);
        play();
      });
      next?.addEventListener('click', () => {
        show(index + 1);
        play();
      });
      dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
          show(dotIndex);
          play();
        });
      });
      play();
    }
  }

  const normalize = (value) => (value || '').toString().trim().toLowerCase();
  const input = document.querySelector('[data-page-filter]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const selects = Array.from(document.querySelectorAll('[data-filter-select]'));

  const applyFilters = () => {
    if (!cards.length) {
      return;
    }

    const query = normalize(input?.value);
    const selectValues = selects.map((select) => ({
      key: select.getAttribute('data-filter-select'),
      value: normalize(select.value)
    }));

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year,
        card.dataset.categoryName
      ].join(' '));
      const matchesText = !query || haystack.includes(query);
      const matchesSelect = selectValues.every(({ key, value }) => {
        if (!value) {
          return true;
        }
        return normalize(card.getAttribute(key)).includes(value);
      });
      card.classList.toggle('is-filtered', !(matchesText && matchesSelect));
    });
  };

  if (input) {
    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get('q');
    if (input.hasAttribute('data-url-query') && queryValue) {
      input.value = queryValue;
    }
    input.addEventListener('input', applyFilters);
  }

  selects.forEach((select) => {
    select.addEventListener('change', applyFilters);
  });

  applyFilters();
})();
