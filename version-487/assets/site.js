(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var empty = document.querySelector('[data-empty-state]');

    if (!panel || cards.length === 0) {
      return;
    }

    var input = panel.querySelector('[data-filter-input]');
    var genre = panel.querySelector('[data-filter-genre]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var initial = getQueryValue('q');

    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var genreValue = normalize(genre ? genre.value : '');
      var regionValue = normalize(region ? region.value : '');
      var yearValue = normalize(year ? year.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.tags
        ].join(' '));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedGenre = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1;
        var matchedRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
        var matchedYear = !yearValue || normalize(card.dataset.year) === yearValue;
        var visible = matchedKeyword && matchedGenre && matchedRegion && matchedYear;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [input, genre, region, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    apply();
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var source = shell.dataset.src;
      var started = false;
      var hlsInstance = null;

      function start() {
        if (!video || !source) {
          return;
        }

        if (started) {
          video.play();
          shell.classList.add('is-playing');
          return;
        }

        started = true;
        shell.classList.add('is-playing');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }

        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = source;
            video.play().catch(function () {});
          }
        }).catch(function () {
          video.src = source;
          video.play().catch(function () {});
        });
      }

      if (button) {
        button.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('click', function () {
          if (!started) {
            start();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var items = Array.prototype.slice.call(carousel.children);
    var current = 0;

    if (items.length < 2) {
      return;
    }

    setInterval(function () {
      current = (current + 1) % items.length;
      var item = items[current];
      carousel.scrollTo({ left: item.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
    }, 3600);
  }

  setupFilters();
  setupPlayers();
  setupHeroCarousel();
})();
