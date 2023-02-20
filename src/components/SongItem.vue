<script setup>
import { ref, onMounted } from 'vue';

import { getJsonAuth } from '@/scripts/fetch.js';
import { useRand } from '@/scripts/colors.js';
import { useStore } from '@/scripts/util.js';
import { useUpdatePlaylist } from '@/scripts/db.js';

import { useResults, useArtist } from '@/stores/results.js';
import { useData, usePlayer } from '@/stores/player.js';

const rand = useRand(),
  data = useData(),
  results = useResults(),
  player = usePlayer(),
  artist = useArtist();

const props = defineProps({
    index: Number,
    author: String,
    title: String,
    channel: String,
    play: String,
    art: String,
    playlistId: String,
  }),
  emit = defineEmits(['open-song', 'nxt-song', 'remove']);

const show = ref(false);

const openSong = el => {
    if (!el.classList.contains('ign')) {
      emit('open-song', props.play);
    }
  },
  addSong = () => {
    data.state.urls.push({
      url: props.play,
      title: props.title,
      thumbnails: [{ url: props.art }],
    });

    const index = data.state.urls.map(s => s.url).indexOf(data.state.url);

    console.log(data.state.urls);

    if (
      (index == data.state.urls.length - 1 && player.state.time > 98) ||
      data.state.urls.length == 1
    )
      emit('open-song', props.play);
  },
  Remove = () => {
    const auth = useStore().getItem('auth'),
      isRemote = results.items?.songs?.title?.startsWith('Playlist - ');

    if (!confirm('Are you sure?')) return;

    if (isRemote && auth) {
      getJsonAuth('/user/playlists/remove', {
        method: 'POST',
        headers: {
          Authorization: auth,
        },
        body: JSON.stringify({
          index: props.index,
          playlistId: props.playlistId,
        }),
      }).then(json => {
        console.log(json);

        if (!json.error) {
          if (json.message == 'ok') emit('remove', props.index);
        } else alert(json.error);
      });
    } else
      useUpdatePlaylist(props.playlistId, props.index, () =>
        emit('remove', props.index),
      );
  },
  Share = async () => {
    if ('share' in navigator) {
      const data = {
        title: `Listen to ${props.title} by ${props.author} on Hyperpipe`,
        url: location.origin + props.play,
      };

      try {
        await navigator.share(data);
        console.log('Done Sharing!');
      } catch (err) {
        console.log(err);
      }
    } else {
      navigator.clipboard.writeText(location.host + props.play).then(
        () => {
          alert('Copied to Clipboard');
        },
        err => {
          console.log(err);
        },
      );
    }
  };

onMounted(() => {
  console.log(props.channel, artist.state.playlistId);
});
</script>
<template>
  <div class="song card flex pop" @click="openSong($event.target)">
    <img class="pop-2 bg-img song-bg" loading="lazy" :src="art" alt />

    <span class="flex content">
      <h4>{{ title }}</h4>
      <a
        :href="channel"
        @click.prevent="artist.getArtist(channel.replace('/channel/', ''))"
        class="ign">
        <i class="ign">{{ author ? author.replaceAll(' - Topic', '') : '' }}</i>
      </a>
    </span>

    <span
      class="bi bi-three-dots-vertical popup-wrap ign"
      @mouseenter="show = true"
      @mouseleave="show = false">
      <Transition name="fade">
        <div v-if="show" class="popup ign">
          <span
            v-if="playlistId"
            class="bi bi-dash-lg clickable ign"
            @click="Remove"></span>
          <span class="bi bi-broadcast ign" @click="$emit('nxt-song')"></span>
          <span class="bi bi-plus-lg clickable ign" @click="addSong"></span>
          <span class="bi bi-share clickable ign" @click="Share"></span>
        </div>
      </Transition>
    </span>
  </div>
</template>

<style scoped>
.card {
  margin: 1rem 0;
  justify-content: initial;
}
span.content {
  padding: 1rem;
  flex-direction: column;
  align-items: flex-start;
  flex-basis: calc(calc(100% - 120px) - 4rem);
}
span.bi-three-dots-vertical {
  margin: 2rem;
}
.popup {
  line-height: auto;
  height: auto;
  right: 0;
  bottom: 0;
  box-shadow: var(--shadow);
  border-radius: 0.25rem;
}
.popup span {
  padding: 0.5rem;
}
.song-bg {
  --grad: v-bind('rand');
  width: 120px;
  height: 120px;
}
.bi-dash-lg {
  color: indianred;
}

[data-compact] .card {
  margin: 0;
}
[data-compact] .song-bg {
  width: 70px;
  height: 70px;
}
</style>
