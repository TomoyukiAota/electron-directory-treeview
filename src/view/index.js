const pathModule = require('path');
const ipc = require('electron').ipcRenderer; // eslint-disable-line import/no-extraneous-dependencies
const $ = require('jquery');
const directoryTree = require('directory-tree');

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
  const locationPromises = treeView
    .getSelectedNodes(data)
    .filter(node => {
      const path = pathIdPairsHandlerForTreeView.getPath(node.id);
      return exifManager.getGpsCoordinates(path) !== null;
    })
    .map(async node => {
      const fileName = node.text;
      const path = pathIdPairsHandlerForTreeView.getPath(node.id);
      const gpsCoordinates = exifManager.getGpsCoordinates(path);
      const thumbnail = await exifManager.getThumbnail(path);
      return {
        name: fileName,
        latitude: gpsCoordinates.latitude,
        longitude: gpsCoordinates.longitude,
        thumbnail: thumbnail
      };
    });

  await Promise.all(locationPromises)
    .then(locations => googleMapsHander.render(locations));
}
