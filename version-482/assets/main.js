(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = selectAll(".hero-slide");
        var dots = selectAll(".hero-dot");
        if (slides.length < 2) {
            return;
        }

        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupFilters() {
        var panels = selectAll("[data-filter-panel]");
        panels.forEach(function (panel) {
            var scopeId = panel.getAttribute("data-filter-panel");
            var scope = document.querySelector('[data-filter-scope="' + scopeId + '"]');
            if (!scope) {
                return;
            }

            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var cards = selectAll("[data-card]", scope);
            var empty = document.querySelector('[data-empty="' + scopeId + '"]');

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var t = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var ok = true;

                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }

                    if (y && cardYear !== y) {
                        ok = false;
                    }

                    if (t && cardType !== t) {
                        ok = false;
                    }

                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }

            apply();
        });
    }

    function setupSearchForms() {
        selectAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                var base = form.getAttribute("data-search-form") || "./search.html";
                var target = value ? base + "?q=" + encodeURIComponent(value) : base;
                window.location.href = target;
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupSearchForms();
    });
})();
