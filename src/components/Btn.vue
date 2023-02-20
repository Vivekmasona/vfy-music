<script setup>
defineProps(['ico']);
defineEmits(['click']);
</script>

<template>
  <button
    :class="'bi clickable bi-' + (ico ? ico : 'play')"
    @click="$emit('click')">
    <slot name="menu"></slot>
  </button>
</template>

<style scoped>
.bi {
  height: 4rem;
  width: 4rem;
  font-size: 4rem;
  color: var(--color-text);
  padding: 0;
  line-height: 0;
  background: var(--color-foreground);
  border-radius: 50%;
  vertical-align: -1rem;
  text-align: center;
  transition: background 0.4s ease;
  margin-right: auto;
}
.bi-play {
  color: var(--color-background-soft);
  box-shadow: 0 0 1rem var(--color-foreground);
  transition: all 0.4s ease;
}
.bi-play::before {
  padding-left: 0.2rem;
}
.bi:hover,
.bi:not(.bi-play) {
  background: transparent;
  box-shadow: none;
}
.bi:not(.bi-play) {
  font-size: 1.75rem;
  width: 3.5rem;
}
</style>
