(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function norm(value) {
    return String(value || "").toLowerCase().trim();
  }

  document.addEventListener("DOMContentLoaded", function () {
    qsa("[data-menu-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = qs("[data-mobile-panel]");
        if (panel) {
          panel.classList.toggle("is-open");
        }
      });
    });

    var slides = qsa("[data-hero-slide]");
    var dots = qsa("[data-hero-dot]");
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    qsa("[data-filter-scope]").forEach(function (scope) {
      var input = qs("[data-filter-input]", scope);
      var typeSelect = qs("[data-filter-type]", scope);
      var yearSelect = qs("[data-filter-year]", scope);
      var items = qsa("[data-search-item]", scope);
      var empty = qs("[data-empty-state]", scope);

      function apply() {
        var query = norm(input ? input.value : "");
        var typeValue = norm(typeSelect ? typeSelect.value : "");
        var yearValue = norm(yearSelect ? yearSelect.value : "");
        var visible = 0;

        items.forEach(function (item) {
          var text = norm([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags")
          ].join(" "));
          var itemType = norm(item.getAttribute("data-type"));
          var itemYear = norm(item.getAttribute("data-year"));
          var okQuery = !query || text.indexOf(query) >= 0;
          var okType = !typeValue || itemType === typeValue;
          var okYear = !yearValue || itemYear === yearValue;
          var isVisible = okQuery && okType && okYear;

          item.style.display = isVisible ? "" : "none";
          if (isVisible) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  });

  window.initMoviePlayer = function (videoId, coverId, sourceUrl) {
    function setup() {
      var video = document.getElementById(videoId);
      var cover = document.getElementById(coverId);
      var attached = false;

      if (!video || !cover || !sourceUrl) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = sourceUrl;
        }
      }

      function play() {
        attach();
        cover.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup);
    } else {
      setup();
    }
  };
})();
