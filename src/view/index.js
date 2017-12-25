const pathModule = require('path');
const ipc = require('electron').ipcRenderer; // eslint-disable-line import/no-extraneous-dependencies
const $ = require('jquery');
const directoryTree = require('directory-tree');
const moment = require('moment-timezone');

const treeView = require('./tree-view');
const pathIdPairsHandlerForTreeView = require('../model/path-id-pairs/path-id-pairs-handler-for-tree-view');
require('./splitter');
const exifManager = require('../model/exif-manager');
const googleMapsHander = require('./google-maps-handler');

$('#select-directory-button').on('click', function (event) {
  ipc.send('open-file-dialog');
});

ipc.on('selected-directory', function (event, selectedPathArray) {
  const selectedPath = selectedPathArray[0];
  $('#selected-directory-area').text(`${pathModule.dirname(selectedPath)}`);
  renderDirectoryTreeArea(selectedPath);
  treeView.update(selectedPath);
});

function renderDirectoryTreeArea(selectedPath) {
  const tree = directoryTree(selectedPath);
  const description = '<p><b>JSON object by directory-tree module</b></p>';
  const stringifiedObject = JSON.stringify(tree, null, 1);
  $('#directory-tree-area').html(`${description}<pre>${stringifiedObject}</pre>`);
}

treeView.onChanged = function (data) {
  displaySelectedItems(data);
  updateGoogleMaps(data);
};

function displaySelectedItems(data) {
  function getHtmlForSelectedNode(node) {
    const fileName = node.text;
    return `${fileName}<br>`;
  }

  const selectedNodes = treeView.getSelectedNodes(data);
  const title = '<b>Selected Items</b><br>';
  const itemDescription = (selectedNodes.length === 0)
    ? 'No items are selected.'
    : selectedNodes.map(node => getHtmlForSelectedNode(node)).join('');
  $('#selected-items').html(`${title}${itemDescription}`);
}

async function updateGoogleMaps(data) {
  function hasGpsCoordinates(node) {
    const path = pathIdPairsHandlerForTreeView.getPath(node.id);
    return exifManager.getGpsCoordinates(path) !== null;
  }

  const photoPromises = treeView
    .getSelectedNodes(data)
    .filter(node => hasGpsCoordinates(node))
    .map(node => createPhotoPromise(node));

  await Promise.all(photoPromises)
    .then(photos => googleMapsHander.render(photos));
}

async function createPhotoPromise(node) {
  const path = pathIdPairsHandlerForTreeView.getPath(node.id);
  const gpsCoordinates = exifManager.getGpsCoordinates(path);
  return {
    name: node.text,
    latitude: gpsCoordinates.latitude,
    longitude: gpsCoordinates.longitude,
    thumbnail: await exifManager.getThumbnail(path),
    dateTime: getDateTime(path)
  };
}

function getDateTime(path) {
  const gpsTime = null;
  const dateTimeOriginal = getDateTimeOriginal(path);
  return gpsTime || dateTimeOriginal;
}

function getDateTimeOriginal(path) {
  // DateTimeOriginal in EXIF is recorded in local time when the photo was taken.
  // moment.js guesses time zone and converts time using the guessed time zone,
  // but converting the local time using guessed time zone results in incorrect time.
  // (It works fine for UTC time, but not for the local time.)
  // Getting UTC time from the local time using GPS coordnates may be possible,
  // but it will take time to implement such routine.
  // So, currently the local time is just used.
  // In order to just use the local time avoiding such conversion,
  // the time zone of Moment instance is set to UTC because no conversion will occur for UTC time zone.
  const dateTimeOriginal = exifManager.getExifProperty(path, 'tags.DateTimeOriginal');
  if (!dateTimeOriginal)
    return null;

  return moment.unix(dateTimeOriginal).tz('UTC').format('YYYY/MM/DD ddd HH:mm:ss');
}
