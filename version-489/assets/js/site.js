(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
  }

  function setupInlineFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    forms.forEach(function (form) {
      var scope = document.querySelector(".filter-scope");
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
      var input = form.querySelector("input");
      var select = form.querySelector("select");
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = select ? select.value.trim() : "";
        cards.forEach(function (card) {
          var okQuery = !q || textOf(card).indexOf(q) > -1;
          var okYear = !y || (card.getAttribute("data-year") || "").indexOf(y) > -1;
          card.hidden = !(okQuery && okYear);
        });
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page]");
    if (!form) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var qInput = form.querySelector("input[name='q']");
    var region = form.querySelector("select[name='region']");
    var type = form.querySelector("select[name='type']");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-scope .movie-card"));

    if (qInput && params.get("q")) {
      qInput.value = params.get("q");
    }

    function apply() {
      var q = qInput ? qInput.value.trim().toLowerCase() : "";
      var r = region ? region.value.trim() : "";
      var t = type ? type.value.trim() : "";
      cards.forEach(function (card) {
        var okQuery = !q || textOf(card).indexOf(q) > -1;
        var okRegion = !r || card.getAttribute("data-region") === r;
        var okType = !t || card.getAttribute("data-type") === t;
        card.hidden = !(okQuery && okRegion && okType);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    Array.prototype.slice.call(form.elements).forEach(function (el) {
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupInlineFilters();
    setupSearchPage();
  });
})();

function initVideoPlayer(videoId, buttonId, url) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button) {
    return;
  }
  var loaded = false;
  var hlsInstance = null;

  function load() {
    if (loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
    loaded = true;
  }

  function start() {
    load();
    button.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      start();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
