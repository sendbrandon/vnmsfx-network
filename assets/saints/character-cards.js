/* Fixed, same-origin collectible downloads. No upload, image generation or storage. */
(function (scope) {
  'use strict';
  const base = '/assets/saints/collectibles/v4/';
  const characters = Object.freeze({nix: '01-nix', rook: '02-rook', brick: '03-brick', vernon: '04-vernon'});
  const names = Object.freeze({nix: 'Nix', rook: 'Rook', brick: 'Brick', vernon: 'Vernon'});
  const labels = Object.freeze({front: 'card front', back: 'card back', wallpaper: 'phone wallpaper'});
  const folders = Object.freeze({front: 'fronts', back: 'backs', wallpaper: 'wallpapers'});

  function asset(character, kind) {
    if (!Object.hasOwn(characters, character) || !Object.hasOwn(folders, kind)) return null;
    const filename = characters[character] + '-' + kind + '-v4.png';
    return Object.freeze({character, asset: kind, format: 'png', filename,
      href: base + folders[kind] + '/' + filename,
      label: names[character] + ' ' + labels[kind]});
  }

  function collection(kind) {
    if (kind === 'print_pdf') return Object.freeze({character: 'all', asset: kind, format: 'pdf',
      filename: 'saints-collectible-2x3-duplex-v4.pdf',
      href: base + 'print/saints-collectible-2x3-duplex-v4.pdf', label: 'Print all four cards'});
    if (kind === 'collection_zip') return Object.freeze({character: 'all', asset: kind, format: 'zip',
      filename: 'saints-collectible-assets-v4.zip',
      href: base + 'saints-collectible-assets-v4.zip', label: 'Complete digital set'});
    return null;
  }

  const api = Object.freeze({asset, collection});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else scope.SaintsCards = api;
})(typeof window === 'object' ? window : globalThis);
