import { useXML } from './xml.js';

export function useDash(streams, len) {
  const sets = [],
    mimes = [[]],
    mimeTypes = [];

  streams.forEach(stream => {
    const i = mimeTypes.indexOf(stream.mimeType);

    if (i > -1) {
      mimes[i].push(stream);
    } else {
      mimeTypes.push(stream.mimeType);
      mimes.push([]);
      mimes[mimeTypes.length - 1].push(stream);
    }
  });

  for (let i in mimeTypes) {
    const set = {
      type: 'element',
      name: 'AdaptationSet',
      attributes: {
        id: i,
        contentType: 'audio',
        mimeType: mimeTypes[i],
        startWithSAP: '1',
        subsegmentAlignment: 'true',
      },
      elements: [],
    };

    mimes[i].forEach(format => {
      const audio = {
        type: 'element',
        name: 'Representation',
        attributes: {
          id: format.itag,
          codecs: format.codec,
          bandwidth: format.bitrate,
        },
        elements: [
          {
            type: 'element',
            name: 'AudioChannelConfiguration',
            attributes: {
              schemeIdUri:
                'urn:mpeg:dash:23003:3:audio_channel_configuration:2011',
              value: '2',
            },
          },
          {
            type: 'element',
            name: 'BaseURL',
            elements: [
              {
                type: 'text',
                text: format.url,
              },
            ],
          },
          {
            type: 'element',
            name: 'SegmentBase',
            attributes: {
              indexRange: `${format.indexStart}-${format.indexEnd}`,
            },
            elements: [
              {
                type: 'element',
                name: 'Initialization',
                attributes: {
                  range: `${format.initStart}-${format.initEnd}`,
                },
              },
            ],
          },
        ],
      };

      set.elements.push(audio);
    });

    sets.push(set);
  }

  const gen = {
    declaration: {
      attributes: {
        version: '1.0',
        encoding: 'utf-8',
      },
    },
    elements: [
      {
        type: 'element',
        name: 'MPD',
        attributes: {
          xmlns: 'urn:mpeg:dash:schema:mpd:2011',
          profiles: 'urn:mpeg:dash:profile:full:2011',
          minBufferTime: 'PT1.5S',
          type: 'static',
          mediaPresentationDuration: `PT${len}S`,
        },
        elements: [
          {
            type: 'element',
            name: 'Period',
            attributes: {
              id: 0,
            },
            elements: sets,
          },
        ],
      },
    ],
  };

  return useXML(gen);
}
