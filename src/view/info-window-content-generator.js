const dateTimeUtility = require('../model/date-time-utility');

/**
 * Generates the content of info window displayed when a marker is clicked in Google Maps.
 * @param {*} photo photo information
 */
exports.generate = function (photo) {
  const root = document.createElement('div');

  const thumbnailElement = createThumbnailElement(photo);
  const nameElement = createNameElement(photo);
  const dateTimeElement = createDateTimeElement(photo);

  [thumbnailElement, nameElement, dateTimeElement]
    .forEach(element => root.appendChild(element));

  return root;
};

function createNameElement(photo) {
  const nameElement = document.createElement('div');
  nameElement.style.textAlign  = 'center';
  nameElement.style.fontWeight = 'bold';
  nameElement.innerText        = photo.name;
  return nameElement;
}

function createDateTimeElement(photo) {
  const dateTime = photo.dateTime || 'Date taken is not available.';
  const dateTimeElement = document.createElement('div');
  dateTimeElement.style.textAlign  = 'center';
  dateTimeElement.style.fontWeight = 'bold';
  dateTimeElement.innerText        = dateTime;
  return dateTimeElement;
}

function createThumbnailElement(photo) {
  const imgElement = document.createElement('img');
  imgElement.border  = 0;
  imgElement.src     = photo.thumbnail.dataUrl;
  imgElement.width   = photo.thumbnail.width;
  imgElement.height  = photo.thumbnail.height;
  imgElement.onclick = event => console.log(dateTimeUtility.getDateTime(photo.path));

  return photo.thumbnail === null
    ? document.createTextNode('Thumbnail is not available.')
    : imgElement;
}
