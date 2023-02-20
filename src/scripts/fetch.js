import { useStore, useSanitize } from './util.js';

export const PIPED_INSTANCE = 'pipedapi.kavin.rocks';
export const HYPERPIPE_INSTANCE = 'hyperpipeapi.onrender.com';

export function getPipedQuery() {
  const papi = new URLSearchParams(location.search).get('pipedapi');

  if (!papi) return '';

  return '?pipedapi=' + useSanitize(papi);
}

export async function getJson(url, opts) {
  const res = await fetch(url, opts)
    .then(res => res.json())
    .catch(err => {
      console.error(err);
      alert(err);
    });

  if (res && res.error) {
    alert(
      res.message
        ? res.message
            .replaceAll('Video', 'Audio')
            .replaceAll('video', 'audio')
            .replaceAll('watched', 'heard')
        : res.error,
    );
    console.error(res.message);
  } else if (res) {
    return JSON.parse(useSanitize(JSON.stringify(res)));
  }
}

export async function getJsonPiped(path, opts) {
  const root =
    new URLSearchParams(location.search).get('pipedapi') ||
    useStore().getItem('pipedapi') ||
    PIPED_INSTANCE;

  return await getJson('https://' + root + path, opts);
}

export async function getJsonHyp(path) {
  const root = useStore().getItem('api') || HYPERPIPE_INSTANCE;

  return await getJson('https://' + root + path);
}

export async function getJsonAuth(path, opts = opts) {
  const root = useStore().getItem('authapi') || PIPED_INSTANCE;

  return await fetch('https://' + root + path, opts)
    .then(res => res.json())
    .catch(err => {
      alert(err);
    });
}

export async function useAuthCreatePlaylist(name) {
  const auth = useStore().getItem('auth');

  if (auth && name) {
    return await getJsonAuth('/user/playlists/create', {
      method: 'POST',
      body: JSON.stringify({
        name: `Playlist - ${name}`,
      }),
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function getAuthPlaylists() {
  const auth = useStore().getItem('auth');

  if (auth) {
    const res = await getJsonAuth('/user/playlists', {
      headers: {
        Authorization: auth,
      },
    });

    return res.filter(i => i.name.startsWith('Playlist - '));
  }
}

export async function useAuthAddToPlaylist(id, path) {
  const auth = useStore().getItem('auth');

  if (auth && id && path) {
    return getJsonAuth('/user/playlists/add', {
      method: 'POST',
      headers: {
        Authorization: auth,
      },
      body: JSON.stringify({
        playlistId: id,
        videoId: new URL('https://example.com' + path).searchParams.get('v'),
      }),
    });
  }
}
