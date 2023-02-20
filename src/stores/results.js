import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';

import { useNav } from '@/stores/misc.js';

import { getJsonPiped, getJsonHyp } from '@/scripts/fetch.js';
import { useRoute } from '@/scripts/util.js';

export const useResults = defineStore('results', () => {
  const items = ref({}),
    search = ref(''),
    chartsId = ref(''),
    next = ref('');

  function setItem(key, val) {
    items.value[key] = val;
    console.log(items.value);
  }

  function resetItems() {
    next.value = undefined;
    useArtist().reset();
    for (let i in items.value) {
      items.value[i] = undefined;
    }
  }

  async function getExplore() {
    const json = await getJsonHyp('/explore');

    console.log(json);
    resetItems();

    chartsId.value = json.chartsId;

    console.log(chartsId.value, json.chartsId);

    setItem('songs', { items: json.trending });
    setItem('albums', { items: json.albums_and_singles });
  }

  async function getAlbum(e) {
    console.log('Album: ', e);

    const hash = new URLSearchParams(e.substring(e.indexOf('?'))).get('list'),
      json = await getJsonPiped('/playlists/' + hash);

    console.log(json, json.relatedStreams);

    resetItems();

    if (
      /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}/.test(
        hash,
      )
    ) {
      json.relatedStreams = json.relatedStreams.map(i => {
        i.playlistId = hash;
        return i;
      });
    }

    setItem('songs', {
      items: json.relatedStreams,
      title: json.name,
    });

    useRoute(e);
    useNav().state.page = 'home';

    next.value =
      json.nextpage && json.nextpage != 'null'
        ? hash + '?nextpage=' + encodeURIComponent(json.nextpage)
        : null;
  }

  return {
    items,
    search,
    chartsId,
    next,
    setItem,
    resetItems,
    getExplore,
    getAlbum,
  };
});

export const useArtist = defineStore('artist', () => {
  const state = reactive({
    playlistId: null,
    title: null,
    description: null,
    subscriberCount: 0,
    hash: null,
    thumbnails: [],
  });

  function reset() {
    for (let i in state) {
      state[i] = undefined;
    }
  }

  function set(obj) {
    for (let i in obj) {
      if (i in state) state[i] = obj[i];
    }
  }

  async function getArtist(e) {
    console.log(e);

    e = e.replace('/channel/', '');

    const json = await getJsonHyp('/channel/' + e),
      results = useResults();

    console.log(json);

    results.resetItems();

    for (let i in json.items) {
      results.setItem(i, { items: json.items[i] });
    }

    console.log(results.items);

    json.items = undefined;
    json.hash = e;

    reset();
    set(json);

    useRoute('/channel/' + e);
    useNav().state.page = 'home';
  }

  return { state, set, reset, getArtist };
});
