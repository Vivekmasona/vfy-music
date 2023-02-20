<script setup>
import { ref, reactive, watch, onMounted } from 'vue';

import AlbumItem from '@/components/AlbumItem.vue';
import SongItem from '@/components/SongItem.vue';

import { getJsonHyp } from '@/scripts/fetch.js';

import { useResults, useArtist } from '@/stores/results.js';
import { useI18n } from '@/stores/misc.js';

defineEmits(['play-urls']);

const { getArtist } = useArtist(),
  results = useResults(),
  { t } = useI18n();

const id = ref(''),
  data = reactive({
    options: [],
    songs: [],
    artists: [],
  });

async function getCharts() {
  const json = await getJsonHyp(
    `/charts?params=${results.chartsId}&code=${id.value}`,
  );

  console.log(json);

  if (!id.value)
    id.value = json.options.all.find(i => i.title == json.options.default).id;

  data.options = json.options.all;
  data.songs = json.trending;
  data.artists = json.artists;
}

watch(id, () => {
  getCharts();
});

onMounted(() => {
  getCharts();
});
</script>

<template>
  <template v-if="data.options.length > 0">
    <select :value="id" class="input" @input="id = $event.target.value">
      <option v-for="i in data.options" :value="i.id" :key="i.id">
        {{ i.title }}
      </option>
    </select>
  </template>

  <template v-if="data.artists.length > 0">
    <h2 class="center">{{ t('title.artists') }}</h2>
    <div class="grid-3 circle">
      <AlbumItem
        v-for="i in data.artists"
        :key="i.id"
        :name="i.title"
        :author="i.subtitle"
        :art="i.thumbnails[1].url"
        @open-album="getArtist(i.id)" />
    </div>
  </template>

  <template v-if="data.songs.length > 0">
    <h2 class="center">{{ t('title.songs') }}</h2>
    <div class="grid">
      <SongItem
        v-for="i in data.songs"
        :key="i.id"
        :title="i.title"
        :author="i.subtitle"
        :channel="'/channel/' + i.subId"
        :art="i.thumbnails[0].url"
        @open-song="
          $emit('play-urls', [
            {
              url: '/watch?v=' + i.id,
              title: i.title,
              thumbnails: [
                {
                  url: i.thumbnails[1]?.url || i.thumbnails[0]?.url,
                },
              ],
            },
          ])
        " />
    </div>
  </template>
</template>
