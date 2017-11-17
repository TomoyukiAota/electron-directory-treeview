// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const $ = require('jquery');
const dir = require('node-dir');
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
  renderDirectoryListArea(selectedPath);
  treeView.render(selectedPath);
});

function renderDirectoryTreeArea(selectedPath) {
  const tree = directoryTree(selectedPath);
  const description = '<p><b>JSON object by directory-tree module</b></p>';
  const stringifiedObject = JSON.stringify(tree, null, 1);
  $('#directory-tree-area').html(`${description}<pre>${stringifiedObject}</pre>`)
}

function renderDirectoryListArea(selectedPath) {
    dir.paths(selectedPath, function(err, paths) {
        if (err)
            throw err;
        const description = '<p><b>Item List</b></p>'
        const fileListString = paths.files.map(file => file + '<br>').join('');
        const fileListAreaHtml = `<p>Files: <br>${fileListString}</p>`;
        const subDirListString = paths.dirs.map(dir => dir + '<br>').join('');
        const subDirListAreaHtml = `<p>Directories: <br>${subDirListString}</p>`;
        $('#directory-list-area').html(`${description}${fileListAreaHtml}${subDirListAreaHtml}`);
    });
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