// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const $ = require('jquery');
const directoryTree = require('directory-tree');

const treeView = require('./tree-view.js');
const pathIdPairUtil = require('../utilities/path-id-pairs/path-id-pairs-utility-for-tree-view');
require('./splitter.js');

$('#select-directory-button').on('click', function (event) {
  ipc.send('open-file-dialog');
});

ipc.on('selected-directory', function (event, selectedPathArray) {
  const selectedPath = selectedPathArray[0];
  $('#selected-directory-area').text(`You selected: ${selectedPath}`);
  renderDirectoryTreeArea(selectedPath);
  treeView.render(selectedPath);
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
    const path = pathIdPairUtil.getPath(node.id);
    return fileName + '<br>' + getImgElementOrMessage(path) + '<br>';
  }

  const selectedNodes = treeView.getSelectedNodes(data);
  const title = '<b>Selected Items</b><br>'
  const itemDescription = (selectedNodes.length === 0)
    ? "No items are selected."
    : selectedNodes.map(node => getHtmlForSelectedNode(node)).join('');
  $("#selected-items").html(`${title}${itemDescription}`);
}