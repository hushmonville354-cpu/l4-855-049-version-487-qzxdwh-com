(function () {
    function readConfig() {
        var node = document.getElementById("player-config");
        if (!node) {
            return null;
        }
        try {
            return JSON.parse(node.textContent || "{}");
        } catch (error) {
            return null;
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        var video = document.getElementById("movie-player");
        var cover = document.querySelector(".player-cover");
        var config = readConfig();
        if (!video || !cover || !config || !config.src) {
            return;
        }
        var stream = config.src;
        var hls = null;
        var ready = false;

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        ready = false;
                    }
                });
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            cover.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
