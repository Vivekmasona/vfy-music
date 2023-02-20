import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';

import en from '@/locales/en.json';

export const SUPPORTED_LOCALES = [
  {
    code: 'ar',
    name: 'عربي',
  },
  {
    code: 'az',
    name: 'Azərbaycan',
  },
  {
    code: 'bn',
    name: 'বাংলা',
  },
  {
    code: 'bs',
    name: 'Bosanski',
  },
  {
    code: 'cs',
    name: 'Čeština',
  },
  {
    code: 'de',
    name: 'Deutsch',
  },
  {
    code: 'en',
    name: 'English',
  },
  {
    code: 'es',
    name: 'Español',
  },
  {
    code: 'fa',
    name: 'فارسی',
  },
  {
    code: 'fr',
    name: 'Français',
  },
  {
    code: 'gl',
    name: 'Galego',
  },
  {
    code: 'hr',
    name: 'Hrvatski',
  },
  {
    code: 'id',
    name: 'Bahasa Indonesia',
  },
  {
    code: 'it',
    name: 'Italiano',
  },
  {
    code: 'ja',
    name: '日本語',
  },
  {
    code: 'ko',
    name: '한국어',
  },
  {
    code: 'nl',
    name: 'Nederlands',
  },
  {
    code: 'ro',
    name: 'Română',
  },
  {
    code: 'ru',
    name: 'Pyccкий',
  },
  {
    code: 'sr',
    name: 'Српски',
  },
  {
    code: 'tr',
    name: 'Türkçe',
  },
  {
    code: 'vi',
    name: 'Tiếng Việt',
  },
  {
    code: 'zh_Hans',
    name: '中文 (简体)',
  },
  {
    code: 'pt_br',
    name: 'Português Brasileiro',
  },
];

export const useNav = defineStore('nav', () => {
  const state = reactive({
    search: '',
    page: 'home',
  });

  return { state };
});

export const useI18n = defineStore('i18n', () => {
  const locale = ref('en'),
    map = ref({
      en: en,
    });

  function t(path) {
    const msgs = map.value[locale.value],
      fallback = map.value['en'],
      keys = path.split('.'),
      translate = msg => keys.reduce((obj, i) => obj?.[i], msg),
      translated = translate(msgs) || translate(fallback);

    return translated || path;
  }

  function setupLocale(code) {
    import(`@/locales/${code}.json`)
      .then(mod => mod.default)
      .then(mod => {
        map.value[code] = mod;
        locale.value = code;
      });
  }

  return { locale, map, t, setupLocale };
});
