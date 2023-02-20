<script setup>
import { ref, watch, onMounted, onBeforeUnmount, onUnmounted } from 'vue';

import muxjs from 'mux.js';
window.muxjs = muxjs;

import { useStore, useRoute } from '@/scripts/util.js';
import { useData, usePlayer } from '@/stores/player.js';

const player = usePlayer(),
  data = useData(),
  store = useStore();

const audio = ref(null);

function audioCanPlay() {
  player.state.status = 'pause';
  audio.value.play().catch(err => {
    console.error(err);
    player.state.status = 'play';
  });

  if (location.pathname != '/playlist') {
    useRoute(data.state.url);
  }

  document.title = `Playing: ${data.state.title} by ${data.state.artist}`;
}

async function Stream() {
  const res = player.state,
    shaka = import('shaka-player/dist/shaka-player.compiled.js');

  let url, mime;

  if (window.MediaSource !== undefined && res.streams.length > 0) {
    const { useDash } = await import('../scripts/dash.js');

    const dash = useDash(res.streams, res.duration);

    url = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(dash);
    mime = 'application/dash+xml';
  } else if (res.hls) {
    url = res.hls;
    mime = 'application/x-mpegURL';
  } else if (res.streams.length > 0) {
    url = res.streams[0].url;
    mime = res.streams[0].mimeType;
  }

  if (!window.audioPlayer) {
    shaka
      .then(shaka => shaka.default)
      .then(shaka => {
        shaka.polyfill.installAll();

        if (shaka.Player.isBrowserSupported) {
          const audioPlayer = new shaka.Player(audio.value);

          const codecs = store.getItem('codec');

          audioPlayer
            .getNetworkingEngine()
            .registerRequestFilter((_type, req) => {
              const headers = req.headers;

              let url = new URL(req.uris[0]);

              if (url.pathname.indexOf('/videoplayback') > -1) {
                if (headers.Range) {
                  url.searchParams.set('range', headers.Range.split('=')[1]);
                  req.headers = {};
                  req.uris[0] = url.toString();
                }
              }
            });

          audioPlayer.configure({
            preferredAudioCodecs: codecs ? codecs.split(':') : ['opus', 'mp4a'],
            manifest: {
              disableVideo: true,
            },
          });

          window.audioPlayer = audioPlayer;
        }
      });
  }

  const quality = store.getItem('quality');

  if (url) {
    window.audioPlayer
      .load(url, 0, mime)
      .then(() => {
        window.audioPlayer.configure('abr.enabled', true);

        if (quality && quality != 'auto') {
          window.audioPlayer.configure('abr.enabled', false);

          const tracks = window.audioPlayer.getVariantTracks(),
            bandwidths = tracks.map(i => i.bandwidth);

          let sel;

          if (quality == 'best') sel = Math.max(...bandwidths);
          else if (quality == 'worst') sel = Math.min(...bandwidths);

          if (sel)
            window.audioPlayer.selectVariantTrack(
              tracks[bandwidths.indexOf(sel)],
            );
        }
      })
      .catch(err => {
        console.error('Code: ' + err.code, err);
      });
  }
}

function destroy() {
  window.audioPlayer.destroy();
  window.audioPlayer = undefined;
}

watch(
  () => player.state.play,
  () => {
    if (audio.value.paused) {
      player.state.status = 'pause';
      audio.value.play().catch(err => {
        console.error(err);
        player.state.status = 'play';
      });
    } else {
      player.state.status = 'play';
      audio.value.pause();
    }
  },
);

watch(() => player.state.streams, Stream);

watch(
  () => player.state.currentTime,
  () => {
    console.log(player.state.currentTime);
    audio.value.currentTime = player.state.currentTime;
  },
);

onMounted(() => {
  Stream();

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => {
      player.state.status = 'pause';

      audio.value.play().catch(err => {
        console.log(err);
        player.state.status = 'play';
      });
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audio.value.pause();
      player.state.status = 'play';
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (data.state.urls.length > 2) {
        const i = data.state.urls.findIndex(s => s.url == data.state.url);

        data.getSong(data.state.urls[i - 1].url);
      }
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (data.state.urls.length > 2) {
        const i = data.state.urls.findIndex(s => s.url == data.state.url);

        data.getSong(data.state.urls[i + 1].url);
      }
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      audio.value.currentTime -= 10;
    });

    navigator.mediaSession.setActionHandler('seekforward', () => {
      audio.value.currentTime += 10;
    });
  }
});

onBeforeUnmount(() => {
  if (window.audioPlayer) destroy();
});
onUnmounted(() => {
  if (window.audioPlayer) destroy();
});
</script>

<template>
  <audio
    id="audio"
    ref="audio"
    :volume="player.state.vol"
    @canplay="audioCanPlay"
    @timeupdate="player.setTime($event.target.currentTime)"
    @ended="data.playNext"
    autoplay></audio>
</template>
