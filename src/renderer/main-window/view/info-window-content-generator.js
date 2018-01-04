const photoViewerLauncher = require('./photo-viewer-launcher');

/**
 * Generates the content of info window displayed when a marker is clicked in Google Maps.
 * @param {*} photo photo information
 */
exports.generate = function (photo) {
  const root = document.createElement('div');

  const thumbnailElement = createThumbnailElement(photo);
  const nameElement = exports.createNameElement(photo);
  const dateTakenElement = exports.createDateTakenElement(photo);

  [thumbnailElement, nameElement, dateTakenElement]
    .forEach(element => root.appendChild(element));

  return root;
};

function createThumbnailElement(photo) {
  if (photo.thumbnail === null) {
    return document.createTextNode('Thumbnail is not available.');
  }

  const thumbnailElement = document.createElement('img');
  thumbnailElement.border  = 0;
  thumbnailElement.src     = photo.thumbnail.dataUrl;
  thumbnailElement.width   = photo.thumbnail.width;
  thumbnailElement.height  = photo.thumbnail.height;
  thumbnailElement.onclick = event => photoViewerLauncher.launch(photo);
  return thumbnailElement;
}

exports.createNameElement = function (photo) {
  const nameElement = document.createElement('div');
  nameElement.style.textAlign  = 'center';
  nameElement.style.fontWeight = 'bold';
  nameElement.innerText        = photo.name;
  return nameElement;
};

exports.createDateTakenElement = function (photo) {
  const dateTaken = photo.dateTaken || 'Date taken is not available.';
  const dateTakenElement = document.createElement('div');
  dateTakenElement.style.textAlign  = 'center';
  dateTakenElement.style.fontWeight = 'bold';
  dateTakenElement.innerText        = dateTaken;
  return dateTakenElement;
};
