const BrowserWindow = require('electron').remote.BrowserWindow; // eslint-disable-line import/no-extraneous-dependencies
const pathModule = require('path');
const urlModule = require('url');

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

function showPhotoViewer(photo) {
  const photoViewerUrl = urlModule.format({
    pathname: pathModule.join(__dirname, './photo-viewer/photo-viewer.html'),
    protocol: 'file:',
    slashes: true,
    query: { photo: encodeURIComponent(JSON.stringify(photo)) }
  });
  let browerWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    title: photo.name
  });
  browerWindow.on('close', function () { browerWindow = null; });
  browerWindow.loadURL(photoViewerUrl);
  browerWindow.show();
}

function createThumbnailElement(photo) {
  if (photo.thumbnail === null) {
    return document.createTextNode('Thumbnail is not available.');
  }

  const thumbnailElement = document.createElement('img');
  thumbnailElement.border  = 0;
  thumbnailElement.src     = photo.thumbnail.dataUrl;
  thumbnailElement.width   = photo.thumbnail.width;
  thumbnailElement.height  = photo.thumbnail.height;
  thumbnailElement.onclick = event => showPhotoViewer(photo);
  return thumbnailElement;
}

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
