(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".filter-input");
      var year = panel.querySelector(".filter-year");
      var region = panel.querySelector(".filter-region");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        cards.forEach(function (card) {
          var matchesKeyword = !keyword || (card.getAttribute("data-search") || "").indexOf(keyword) !== -1;
          var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchesRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
          card.classList.toggle("is-filter-hidden", !(matchesKeyword && matchesYear && matchesRegion));
        });
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  var hlsLoadPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoadPromise) {
      return hlsLoadPromise;
    }
    hlsLoadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("load failed"));
      };
      document.head.appendChild(script);
    });
    return hlsLoadPromise;
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-cover");
      var source = player.getAttribute("data-video-url");
      var hlsInstance = null;
      var started = false;

      function playVideo() {
        if (!video || !source) {
          return;
        }
        if (button) {
          button.classList.add("is-hidden");
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }

        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
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
        button.addEventListener("click", playVideo);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started || video.paused) {
            playVideo();
          }
        });
        video.addEventListener("emptied", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      }
    });
  }

  function createResultCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";

    var poster = document.createElement("a");
    poster.className = "poster-wrap";
    poster.href = item.url;

    var image = document.createElement("img");
    image.src = item.cover;
    image.alt = item.title + "封面";
    image.loading = "lazy";

    var badge = document.createElement("span");
    badge.className = "poster-badge";
    badge.textContent = item.year;

    poster.appendChild(image);
    poster.appendChild(badge);

    var body = document.createElement("div");
    body.className = "movie-card-body";

    var meta = document.createElement("div");
    meta.className = "movie-meta";
    [item.region, item.type].forEach(function (value) {
      var span = document.createElement("span");
      span.textContent = value;
      meta.appendChild(span);
    });

    var title = document.createElement("h2");
    var link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.title;
    title.appendChild(link);

    var summary = document.createElement("p");
    summary.textContent = item.oneLine;

    var tags = document.createElement("div");
    tags.className = "tag-row";
    (item.tags || []).slice(0, 3).forEach(function (tag) {
      var span = document.createElement("span");
      span.textContent = tag;
      tags.appendChild(span);
    });

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(summary);
    body.appendChild(tags);
    article.appendChild(poster);
    article.appendChild(body);
    return article;
  }

  function initSearchPage() {
    var results = document.querySelector(".search-results");
    if (!results || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim().toLowerCase();
    var title = document.querySelector(".search-title");
    var input = document.querySelector(".search-page-form input[name='q']");
    if (input) {
      input.value = params.get("q") || "";
    }
    if (!keyword) {
      return;
    }
    var matches = window.SEARCH_DATA.filter(function (item) {
      return item.searchText.indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = "搜索结果：" + (params.get("q") || "");
    }
    results.innerHTML = "";
    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "article-block";
      empty.textContent = "没有找到匹配内容，可以尝试更换关键词。";
      results.appendChild(empty);
      return;
    }
    matches.forEach(function (item) {
      results.appendChild(createResultCard(item));
    });
  }

  ready(function () {
    initMobileMenu();
    initCarousel();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
