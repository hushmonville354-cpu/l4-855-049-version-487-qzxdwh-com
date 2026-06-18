(function () {
    window.setupMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movie-video");
        var cover = document.querySelector("[data-player-cover]");
        var started = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (started) {
                return;
            }

            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function startPlay() {
            attachSource();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            video.setAttribute("controls", "controls");
            var playResult = video.play();

            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", startPlay);
        }

        video.addEventListener("click", function () {
            if (!started || video.paused) {
                startPlay();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
