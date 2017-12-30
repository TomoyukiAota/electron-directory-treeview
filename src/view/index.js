const pathModule = require('path');
const ipc = require('electron').ipcRenderer; // eslint-disable-line import/no-extraneous-dependencies
const $ = require('jquery');

const selectedDirectoryManager = require('../model/selected-directory-manager');
const treeView = require('./tree-view');
const pathIdPairsHandlerForTreeView = require('../model/path-id-pairs/path-id-pairs-handler-for-tree-view');
require('./splitter');
const exifManager = require('../model/exif-manager');
const googleMapsHander = require('./google-maps-handler');
const photoInfoGenerator = require('../model/photo-info-generator');

$('#select-directory-button').on('click', function (event) {
  ipc.send('open-file-dialog');
});

ipc.on('selected-directory', async function (event, selectedPathArray) {
  const selectedPath = selectedPathArray[0];
  $('#selected-directory-area').text(`${pathModule.dirname(selectedPath)}`);
  await selectedDirectoryManager.update(selectedPath);
  const dataForJsTree = selectedDirectoryManager.generateDataForJsTree();
  treeView.update(dataForJsTree);
});

treeView.onChanged = function (data) {
  updateGoogleMaps(data);
};

async function updateGoogleMaps(data) {
  function hasGpsCoordinates(node) {
    const path = pathIdPairsHandlerForTreeView.getPath(node.id);
    return exifManager.getGpsCoordinates(path) !== null;
  }

  const photoPromises = treeView
    .getSelectedNodes(data)
    .filter(node => hasGpsCoordinates(node))
    .map(node => {
      const fileName = node.text;
      const path = pathIdPairsHandlerForTreeView.getPath(node.id);
      return photoInfoGenerator.generate(fileName, path);
    });

  await Promise.all(photoPromises)
    .then(photos => googleMapsHander.render(photos));
}
