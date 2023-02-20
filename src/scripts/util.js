import DOMPurify from 'dompurify';

export function useSanitize(txt) {
  return DOMPurify.sanitize(txt, {
    ALLOWED_TAGS: ['br'],
  });
}

export function useRoute(l) {
  history.pushState({}, '', l);
}

export function useWrap(txt) {
  return encodeURIComponent(txt).replaceAll('%20', '+');
}

export function useUnwrap(txt) {
  return decodeURIComponent(txt).replaceAll('+', ' ');
}

export function useStore() {
  try {
    return window.localStorage;
  } catch (err) {
    console.error(err);

    const error = i => {
      console.error("Failed to Access '" + i + "' Please Enable localStorage.");
    };

    return {
      getItem: error,
      setItem: error,
    };
  }
}

export function useMetadata(url, urls, data) {
  if ('mediaSession' in navigator) {
    const now = urls.find(u => u.url === url);

    let artwork = [],
      album = undefined;

    if (now) {
      album = now.subtitle;

      if (now.thumbnails) {
        artwork = now.thumbnails.map(t => ({
          sizes: t.width && t.height ? t.width + 'x' + t.height : '512x512',
          src: t.url,
          type: 'image/webp',
        }));
      } else if (data.art) artwork = [{ src: data.art, type: 'image/webp' }];

      console.log(album, artwork);
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: data.title,
      artist: data.artist,
      album: album,
      artwork: artwork,
    });
  }
}
