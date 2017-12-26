exports.generate = function (photo) {
  const thumbnail = photo.thumbnail;
  const thumbnailArea = thumbnail === null
    ? 'Thumbnail is not available.'
    : `<img border="0" src="${thumbnail.dataUrl}" `
      + `width="${thumbnail.width}" height="${thumbnail.height}"/>`;
  const dateTime = photo.dateTime || 'Date taken is not available.';
  const description
    = `<div style="text-align:center"><b>${photo.name}<b/><div/>`
    + `<div style="text-align:center"><b>${dateTime}<b/><div/>`;
  return thumbnailArea + description;
};
