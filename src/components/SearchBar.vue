<script setup>
import { ref } from 'vue';
import { useNav, useI18n } from '@/stores/misc.js';

const { t } = useI18n(),
  show = ref(false),
  nav = useNav();

function search(e) {
  nav.state.search = e.target.value;
  nav.state.page = 'home';
  e.target.blur();
}
</script>

<template>
  <button
    aria-label="Search Button"
    class="bi bi-search popup-wrap"
    @mouseenter="show = true"
    @mouseleave="show = false">
    <Transition name="fade">
      <div v-show="show" class="popup">
        <input
          type="search"
          aria-label="Search Input"
          :placeholder="t('title.search') + '...'"
          @change="search"
          @keyup.enter="search"
          :value="nav.state.search" />
      </div>
    </Transition>
  </button>
</template>

<style scoped>
.popup {
  background: transparent;
  right: 0;
  top: -0.5rem;
  bottom: -0.5rem;
  padding: 0;
}
.popup input {
  color: var(--color-text);
  width: calc(100vw - 4rem);
  max-width: 600px;
  font-size: 1rem;
  border: none;
  border-radius: inherit;
  background: var(--color-background-mute);
  text-align: center;
}
</style>
