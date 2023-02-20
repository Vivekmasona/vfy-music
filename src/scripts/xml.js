function useAttr(json) {
  let attrs = '';

  for (const attr in json) {
    if (json[attr] != null) {
      attrs += ' ';
      attrs += attr;
      attrs += '="';
      attrs += ('' + json[attr]).replace(/"/g, '&quote;');
      attrs += '"';
    }
  }

  return attrs;
}

function useElems(json) {
  let elems = '';

  json.forEach(elem => {
    switch (elem.type) {
      case 'element':
        elems += '<';
        elems += elem.name;
        elems += useAttr(elem.attributes);

        if (elem?.elements?.length > 0) {
          elems += '>';
          elems += useElems(elem.elements);
          elems += '</';
          elems += elem.name;
          elems += '>';
        } else elems += '/>';
        break;
      case 'text':
        elems += ('' + elem.text)
          .replace(/&amp;/g, '&')
          .replace(/&/g, '&amp;')
          .replace(/>/g, '&gt;')
          .replace(/</g, '&lt;');
        break;
    }
  });

  return elems;
}

export function useXML(json) {
  json = JSON.parse(JSON.stringify(json));

  let base = '';

  base += '<?xml';
  base += useAttr(json.declaration.attributes);
  base += '?>';

  base += useElems(json.elements);

  console.log(base);

  return base;
}
