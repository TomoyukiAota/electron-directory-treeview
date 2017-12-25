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
  return getGpsDateTime(path) || getDateTimeOriginal(path);
}

function getGpsDateTime(path) {
  const gpsDateTime = exifManager.getGpsDateTime(path);
  if (!gpsDateTime)
    return null;

  const timeZone = moment.tz.guess();
  const formattedGpsDateTime = gpsDateTime.tz(timeZone).format('YYYY/MM/DD ddd HH:mm:ss');
  const formattedTimeZone = moment.tz(timeZone).format('z');
  return `${formattedGpsDateTime} (${formattedTimeZone})`;
}

function getDateTimeOriginal(path) {
  // DateTimeOriginal in EXIF is recorded in unix timestamp format but in local time when the photo was taken.
  // Also, moment.js guesses time zone and formats time using the guessed time zone.
  // So, formatting the local time using guessed time zone results in extra conversion which gives incorrect time.
  // In order to just use the local time avoiding such conversion,
  // the time zone of Moment instance is set to UTC because no conversion will occur when UTC time zone is used.
  const dateTimeOriginal = exifManager.getExifProperty(path, 'tags.DateTimeOriginal');
  if (!dateTimeOriginal)
    return null;

  return moment.unix(dateTimeOriginal).tz('UTC').format('YYYY/MM/DD ddd HH:mm:ss');
}
