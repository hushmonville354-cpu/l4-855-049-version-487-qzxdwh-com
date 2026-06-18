(function () {
    function setupPlayer(shell) {
        var video = shell.querySelector('.video-player');
        var button = shell.querySelector('[data-play-trigger]');
        var message = shell.querySelector('[data-player-message]');
        var hlsInstance = null;

        if (!video || !button) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function play() {
            var source = video.getAttribute('data-src');
            if (!source) {
                setMessage('当前影片暂无可用播放源。');
                return;
            }

            button.classList.add('is-hidden');
            setMessage('正在初始化播放源…');

            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage('播放源已就绪。');
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {
                            setMessage('浏览器阻止了自动播放，请再次点击视频播放。');
                        });
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放源加载失败，请刷新页面后重试。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setMessage('播放源已就绪。');
                    video.play();
                }, { once: true });
            } else {
                video.src = source;
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {
                        setMessage('当前浏览器可能不支持 HLS，请使用新版浏览器访问。');
                    });
                }
            }
        }

        button.addEventListener('click', play);
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
    });
})();
