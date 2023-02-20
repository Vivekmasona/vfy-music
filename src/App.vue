<script setup>
/* Imports */
import {
  ref,
  watch,
  reactive,
  defineAsyncComponent,
  onBeforeMount,
  onMounted,
} from 'vue';

/* Components */
import NavBar from '@/components/NavBar.vue';
import Player from '@/components/Player.vue';
import StatusBar from '@/components/StatusBar.vue';
import NowPlaying from '@/components/NowPlaying.vue';
import Search from '@/components/Search.vue';
import Playlists from '@/components/Playlists.vue';
import Lyrics from '@/components/Lyrics.vue';
import Info from '@/components/Info.vue';
import Artist from '@/components/Artist.vue';

/* Async Components */
const Genres = defineAsyncComponent(() => import('@/components/Genres.vue')),
  Charts = defineAsyncComponent(() => import('@/components/Charts.vue')),
  NewPlaylist = defineAsyncComponent(() =>
    import('@/components/NewPlaylist.vue'),
  ),
  Prefs = defineAsyncComponent(() => import('@/components/Prefs.vue'));

/* Composables */
import { useStore, useUnwrap } from '@/scripts/util.js';
import { useSetupDB, useUpdatePlaylist } from '@/scripts/db.js';

/* Stores */
import { useData, usePlayer } from '@/stores/player.js';
import { useResults, useArtist } from '@/stores/results.js';
import { useNav, useI18n } from '@/stores/misc.js';

const { t, setupLocale } = useI18n(),
  store = useStore(),
  data = useData(),
  player = usePlayer(),
  results = useResults(),
  artist = useArtist(),
  nav = useNav();

const genreid = ref(''),
  path = ref(location.pathname);

/* Functions */
function parseUrl() {
  const loc = location.pathname.split('/'),
    base = loc[1].replace(location.search, '');

  console.log(loc, base);

  path.value = location.pathname;

  switch (base) {
    case '':
      results.getExplore();
      break;
    case 'search':
      nav.state.search = useUnwrap(loc[2]);
      break;
    case 'watch':
      player.state.status = 'circle';
      data.getSong(loc[1] + location.search);
      console.log(loc[1]);
      break;
    case 'playlist':
      results.getAlbum(loc[1] + location.search);
      console.log(loc[1]);
      break;
    case 'channel':
      artist.getArtist(loc[2]);
      console.log(loc[2]);
      break;
    case 'explore':
      genreid.value = loc[2];
      nav.state.page = 'explore';
      break;
    case 'charts':
      nav.state.page = 'charts';
      break;
    case 'library':
      nav.state.page = 'library';
      break;
    case 'prefs':
      nav.state.page = 'prefs';
      break;
    default:
      console.log(loc);
      break;
  }
}

function playThis(t) {
  const i = data.state.urls.indexOf(t);
  data.getSong(data.state.urls[i].url);
}

function playList(a) {
  data.state.urls = a;
  data.getSong(data.state.urls[0].url);
}

/* Lifestyle hooks */
onBeforeMount(() => {
  /* Set the default theme if set */
  if (store.theme) document.body.setAttribute('data-theme', store.theme);
  if (store.compact == 'true') document.body.setAttribute('data-compact', '');

  /* Set the default locale if set */
  if (store.locale) setupLocale(store.locale);

  /* Set the default tab */
  if (location.pathname == '/' && store.page) nav.state.page = store.page;
});

onMounted(() => {
  /* Event Listener for change in url */
  window.addEventListener('popstate', parseUrl);

  /* Alert User on close if url is present */
  window.onbeforeunload = () => {
    if (data.state.url) return 'Are you Sure?';
  };

  /* Setup IndexedDB for storing custom playlists */
  useSetupDB();

  parseUrl();

  console.log('Mounted <App>!');
});
</script>

<template>
  <NavBar @explore="results.getExplore" />

  <template v-if="artist.state.title && nav.state.page == 'home'">
    <Artist />
  </template>

  <header v-if="!artist.state.title">
    <img
      v-if="data.state.art"
      class="art"
      loading="lazy"
      :src="data.state.art.replaceAll('&amp;', '&')" />

    <div class="wrapper">
      <NowPlaying @get-artist="artist.getArtist" />
    </div>
  </header>

  <main class="placeholder" :data-placeholder="t('info.search')">
    <KeepAlive>
      <Search v-if="nav.state.page == 'home'" @play-urls="playList" />
    </KeepAlive>

    <KeepAlive>
      <Genres v-if="nav.state.page == 'explore'" :id="genreid" />
    </KeepAlive>

    <KeepAlive>
      <Charts v-if="nav.state.page == 'charts'" @play-urls="playList" />
    </KeepAlive>

    <NewPlaylist
      v-if="nav.state.page == 'library'"
      @play-urls="playList"
      @open-playlist="results.getAlbum" />

    <Prefs v-if="nav.state.page == 'prefs'" />
  </main>

  <Transition name="fade">
    <Playlists v-if="player.state.playlist" @playthis="playThis" />
  </Transition>

  <Transition name="fade">
    <Lyrics v-if="player.state.lyrics" />
  </Transition>

  <Transition name="fade">
    <Info v-if="player.state.info" :text="data.state.description" />
  </Transition>

  <StatusBar />

  <Player />
</template>

<style>
@import './assets/base.css';

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
  margin-bottom: 10rem;
}
main {
  display: flex;
  flex-direction: column;
}
main:empty::before {
  font-size: 3.5rem !important;
}
header {
  line-height: 1.5;
  padding-bottom: 2.5rem;
}
.art {
  display: block;
  margin: 0 auto 2rem;
  height: 175px;
  width: 175px;
}
img,
.card,
.card-bg {
  border-radius: 0.25rem;
  border-radius: 0.25rem;
}
h1 {
  text-align: center;
  padding-bottom: 1.5rem;
}
h1,
h4 {
  font-weight: bold;
}
a,
.green {
  text-decoration: none;
  color: var(--color-foreground);
  transition: 0.4s;
}
a:focus {
  outline: none;
}
a:focus-visible {
  border-radius: 0.25rem;
  outline: 0.2rem solid var(--color-border);
  transition: none;
}
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
.center {
  margin-left: auto;
  margin-right: auto;
}
.flex .bi {
  line-height: 0;
}

@media (hover: hover) {
  a:hover {
    background-color: var(--color-border);
  }
}

@media (min-width: 1024px) {
  header {
    margin: auto;
    display: flex;
    place-items: center;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
  .art {
    margin: 0 2rem 0 0;
  }
}
</style>
