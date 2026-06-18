(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var empty = filterRoot.querySelector('.empty-state');

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
        var matchRegion = !r || normalize(card.getAttribute('data-region')) === r;
        var show = matchQuery && matchYear && matchRegion;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && Array.isArray(window.__MOVIE_INDEX__)) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = searchPage.querySelector('[data-search-input]');
    var resultBox = searchPage.querySelector('[data-search-results]');
    var initial = params.get('q') || '';
    if (searchInput) {
      searchInput.value = initial;
    }

    function renderSearch() {
      var q = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
      var items = window.__MOVIE_INDEX__;
      var results = q ? items.filter(function (item) {
        return [item.title, item.region, item.year, item.genre, item.tags].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120) : items.slice(0, 72);

      if (!resultBox) {
        return;
      }

      resultBox.innerHTML = results.map(function (item) {
        return '<article class="movie-card" data-title="' + escapeAttr(item.title) + '">' +
          '<a class="poster-link" href="' + escapeAttr(item.file) + '">' +
          '<img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">' +
          '<span class="play-dot">▶</span><b class="card-badge">' + escapeHtml(item.year) + '</b></a>' +
          '<div class="card-body"><h3><a href="' + escapeAttr(item.file) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.oneLine) + '</p><div class="card-meta"><span>' + escapeHtml(item.region) + '</span>' +
          '<span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.score) + '</span></div></div></article>';
      }).join('');

      if (!results.length) {
        resultBox.innerHTML = '<div class="empty-state" style="display:block">未找到相关影片</div>';
      }
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]);
      });
    }

    function escapeAttr(value) {
      return escapeHtml(value).replace(/`/g, '&#96;');
    }

    if (searchInput) {
      searchInput.addEventListener('input', renderSearch);
    }
    renderSearch();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var source = player.getAttribute('data-video');
    var started = false;
    var hlsInstance = null;

    function startVideo() {
      if (!video || !source) {
        return;
      }
      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        started = true;
      }
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }
    video.addEventListener('click', function () {
      if (!started) {
        startVideo();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
