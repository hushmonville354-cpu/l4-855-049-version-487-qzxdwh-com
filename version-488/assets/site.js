(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return (value || "").toString().toLowerCase();
    }

    function initMenu() {
        var button = select(".menu-toggle");
        var panel = select(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slides = selectAll("[data-hero-slide]");
        var dots = selectAll("[data-hero-dot]");
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                window.clearInterval(timer);
                start();
            });
        });
        start();
    }

    function initCatalog() {
        var grid = select(".catalog-grid");
        if (!grid) {
            return;
        }
        var input = select(".catalog-search");
        var filters = selectAll(".catalog-filter");
        var cards = selectAll(".catalog-card", grid);
        var empty = select(".empty-state");
        function apply() {
            var keyword = text(input && input.value);
            var active = {};
            filters.forEach(function (filter) {
                active[filter.getAttribute("data-filter")] = filter.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var hay = text([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matched = !keyword || hay.indexOf(keyword) !== -1;
                Object.keys(active).forEach(function (key) {
                    if (active[key] && card.getAttribute("data-" + key) !== active[key]) {
                        matched = false;
                    }
                });
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        filters.forEach(function (filter) {
            filter.addEventListener("change", apply);
        });
    }

    function cardMarkup(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card compact-card\">" +
            "<a class=\"poster\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.category) + "</span>" +
            "<span class=\"poster-time\">" + escapeHtml(movie.duration) + "</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.line) + "</p>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<div class=\"card-tags\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initSearchPage() {
        var results = select("#search-results");
        if (!results || !window.SITE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = select("#search-page-input");
        var title = select("#search-result-title");
        var empty = select("#search-empty");
        if (input) {
            input.value = query;
        }
        var lower = text(query);
        var list = window.SITE_SEARCH_INDEX.filter(function (movie) {
            if (!lower) {
                return true;
            }
            return text([movie.title, movie.category, movie.region, movie.year, movie.type, movie.genre, movie.line, (movie.tags || []).join(" ")].join(" ")).indexOf(lower) !== -1;
        }).slice(0, 240);
        if (title) {
            title.textContent = lower ? "搜索结果" : "精选结果";
        }
        results.innerHTML = list.map(cardMarkup).join("");
        if (empty) {
            empty.hidden = list.length !== 0;
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initCatalog();
        initSearchPage();
    });
})();
