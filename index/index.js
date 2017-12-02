const fs = require('fs');
const path = require('path'); 
const ipc = require('electron').ipcRenderer;
const $ = require('jquery');
const directoryTree = require('directory-tree');

const treeView = require('./tree-view.js');
const pathIdPairsHandlerForTreeView = require('../model/path-id-pairs/path-id-pairs-handler-for-tree-view');
require('./splitter.js');

$('#select-directory-button').on('click', function (event) {
  ipc.send('open-file-dialog');
});

ipc.on('selected-directory', function (event, selectedPathArray) {
  const selectedPath = selectedPathArray[0];
  $('#selected-directory-area').text(`${path.dirname(selectedPath)}`);
  renderDirectoryTreeArea(selectedPath);
  treeView.update(selectedPath);
});

function renderDirectoryTreeArea(selectedPath) {
  const tree = directoryTree(selectedPath);
  const description = '<p><b>JSON object by directory-tree module</b></p>';
  const stringifiedObject = JSON.stringify(tree, null, 1);
  $('#directory-tree-area').html(`${description}<pre>${stringifiedObject}</pre>`)
}

treeView.onChanged = function(data) {
  function getHtmlForSelectedNode(node) {
    function getImgElementOrMessage(path) {
      if (!fs.existsSync(path))
        return "File/Directory not found.";
      
      return fs.statSync(path).isFile()
        ? `<img src='${path}' width='160' height='160' ><br>`
        : "";
    }

    const fileName = node.text;
    const path = pathIdPairsHandlerForTreeView.getPath(node.id);
    return fileName + '<br>' + getImgElementOrMessage(path) + '<br>';
  }

  const selectedNodes = treeView.getSelectedNodes(data);
  const title = '<b>Selected Items</b><br>'
  const itemDescription = (selectedNodes.length === 0)
    ? "No items are selected."
    : selectedNodes.map(node => getHtmlForSelectedNode(node)).join('');
  $("#selected-items").html(`${title}${itemDescription}`);
}