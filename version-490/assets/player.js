(() => {
  const roots = document.querySelectorAll('[data-player]');

  roots.forEach((root) => {
    const video = root.querySelector('video');
    const overlay = root.querySelector('[data-play-overlay]');
    const button = root.querySelector('[data-play-button]');
    const stream = root.getAttribute('data-stream');
    let initialized = false;
    let busy = false;
    let hls = null;

    const load = () => {
      if (initialized || !video || !stream) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      }
    };

    const start = async () => {
      if (busy) {
        return;
      }

      busy = true;
      load();
      video.controls = true;
      overlay?.classList.add('is-hidden');

      try {
        await video.play();
      } catch (error) {
        overlay?.classList.remove('is-hidden');
      } finally {
        busy = false;
      }
    };

    button?.addEventListener('click', (event) => {
      event.stopPropagation();
      start();
    });

    overlay?.addEventListener('click', () => {
      start();
    });

    video?.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
