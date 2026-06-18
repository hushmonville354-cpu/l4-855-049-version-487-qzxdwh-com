(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var path = form.getAttribute('data-search-path') || form.getAttribute('action') || 'search.html';
                var query = input ? input.value.trim() : '';
                var target = path;
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupImageFallbacks() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                var wrapper = img.closest('.poster, .ranking-cover, .detail-poster');
                if (wrapper) {
                    wrapper.classList.add('cover-missing');
                }
                img.remove();
            });
        });
    }

    function setupFilters() {
        var panels = qsa('[data-filter-panel]');
        panels.forEach(function (panel) {
            var keywordInput = qs('[data-local-filter]', panel);
            var selects = qsa('[data-filter-select]', panel);
            var count = qs('[data-filter-count]', panel);
            var cards = qsa('[data-movie-card]');

            if (!cards.length) {
                return;
            }

            function getParamQuery() {
                var params = new URLSearchParams(window.location.search);
                return params.get('q') || '';
            }

            if (keywordInput && !keywordInput.value) {
                keywordInput.value = getParamQuery();
            }

            function apply() {
                var keyword = normalize(keywordInput ? keywordInput.value : '');
                var filters = {};
                selects.forEach(function (select) {
                    var name = select.getAttribute('data-filter-select');
                    filters[name] = normalize(select.value);
                });
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-category')
                    ].join(' '));

                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    Object.keys(filters).forEach(function (key) {
                        var value = filters[key];
                        if (!value) {
                            return;
                        }
                        var cardValue = normalize(card.getAttribute('data-' + key));
                        if (cardValue.indexOf(value) === -1) {
                            ok = false;
                        }
                    });

                    card.classList.toggle('hidden-by-filter', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + ' 部影片';
                }
            }

            if (keywordInput) {
                keywordInput.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupImageFallbacks();
        setupFilters();
    });
})();
