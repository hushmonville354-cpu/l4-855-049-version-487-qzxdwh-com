(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function toggleMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function startHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
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
      card.getAttribute("data-title") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-genre") || ""
    ].join(" ").toLowerCase();
  }

  function startLocalFilter() {
    var input = document.querySelector(".local-filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    if (!cards.length) {
      return;
    }
    var active = "all";

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = textOf(card);
        var type = card.getAttribute("data-type") || "";
        var matchedText = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = active === "all" || type === active;
        card.style.display = matchedText && matchedType ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        active = chip.getAttribute("data-filter") || "all";
        applyFilter();
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(item.link) + "\" aria-label=\"观看 " + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-glow\"></span>",
      "<span class=\"play-dot\">▶</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
      "<h2><a href=\"" + escapeHtml(item.link) + "\">" + escapeHtml(item.title) + "</a></h2>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function startSearchPage() {
    var box = document.getElementById("search-results");
    var title = document.getElementById("search-result-title");
    var input = document.getElementById("site-search-input");
    if (!box || !Array.isArray(window.SEARCH_INDEX)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) {
      input.value = q;
    }

    function render(keyword) {
      var needle = keyword.trim().toLowerCase();
      var pool = window.SEARCH_INDEX;
      var results = needle ? pool.filter(function (item) {
        return item.searchText.indexOf(needle) !== -1;
      }).slice(0, 120) : pool.slice(0, 24);

      if (title) {
        title.textContent = needle ? "搜索结果" : "精选推荐";
      }
      box.innerHTML = results.map(cardTemplate).join("");
    }

    render(q);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  ready(function () {
    toggleMenu();
    startHero();
    startLocalFilter();
    startSearchPage();
  });
}());

function initializeMoviePlayer(playerId, streamUrl) {
  var shell = document.getElementById(playerId);
  if (!shell) {
    return;
  }
  var video = shell.querySelector("video");
  var button = shell.querySelector(".play-overlay");
  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (attached || !video) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attach();
    shell.classList.add("is-playing");
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        shell.classList.remove("is-playing");
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });
    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
    });
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
