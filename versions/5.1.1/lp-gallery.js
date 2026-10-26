/* The simulator's picture library as Lollipop's Photos (photos.js) groups it: the Camera and Pictures albums and the
   clusters it can read without location, faces or tags. The image has no Gallery app, so nothing else of Gallery2 is
   here. */
(() => {
  'use strict';
  const albumOf = photo => photo.album || (photo.id <= 4 ? 'pictures' : 'camera');

  // FilterUtils clustering: albums, one "No location" group, day clusters by capture time, no faces, "Untagged".
  function groups(data, cluster, locale = 'en-US') {
    const photos = data.photos || [];
    if (cluster === 'location') return photos.length ? [{key: 'location:none', name: 'No location', items: photos}] : [];
    if (cluster === 'people') return [];
    if (cluster === 'tag') return photos.length ? [{key: 'tag:none', name: 'Untagged', items: photos}] : [];
    if (cluster === 'time') {
      const map = new Map();
      for (const photo of photos) {
        const day = photo.created ? new Date(photo.created) : null, key = day ? `time:${day.getFullYear()}-${day.getMonth()}-${day.getDate()}` : 'time:unknown';
        if (!map.has(key)) map.set(key, {key, name: day ? day.toLocaleDateString(locale, {month: 'short', day: 'numeric', year: 'numeric'}) : 'Unknown', translate: !day, items: []});
        map.get(key).items.push(photo);
      }
      return [...map.values()];
    }
    return [['camera', 'Camera', true], ['pictures', 'Pictures', true], ['download', 'Download', false]].map(([key, name, translate]) => ({key, name, translate, items: photos.filter(p => albumOf(p) === key)})).filter(group => group.items.length);
  }
  function items(data, ui, locale) {
    const cluster = ui.galleryCluster || 'album';
    return groups(data, cluster, locale).find(group => group.key === ui.galleryAlbum)?.items || (cluster === 'album' && ['camera', 'pictures'].includes(ui.galleryAlbum) ? (data.photos || []).filter(p => albumOf(p) === ui.galleryAlbum) : []);
  }
  window.LPGallery = {groups, items};
})();
