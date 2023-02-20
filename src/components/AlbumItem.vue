<script setup>
import { useRand } from '@/scripts/colors.js';

const rand = useRand();

defineProps({
  name: String,
  author: {
    type: String,
    default: '',
  },
  grad: String,
  art: {
    type: String,
    default: '/1x1.png',
  },
});

defineEmits(['open-album']);
</script>

<template>
  <div class="album card pop" @click="$emit('open-album')">
    <img class="card-bg bg-img pop-2" :src="art" loading="lazy" alt />

    <div class="card-text">
      <h4>{{ name }}</h4>
      <i>{{ author }}</i>
    </div>
  </div>
</template>

<style scoped>
.card {
  min-height: 17rem;
  width: 15rem;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: auto;
}
.card-bg {
  --grad: v-bind('grad || rand');
  height: 13rem;
  width: 13rem;
}
.card-text {
  margin-top: 0.5rem;
  cursor: default;
}

[data-compact] .card {
  min-height: 12rem;
  width: 10rem;
}
[data-compact] .card-bg {
  width: 7rem;
  height: 7rem;
}
[data-compact] .card-text {
  margin-top: 0.25rem;
}
</style>
