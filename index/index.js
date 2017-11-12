// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const dir = require('node-dir');
const dirTree = require('directory-tree');

const treeView = require('./tree-view.js');
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
  const tree = dirTree(selectedPath);
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
  const selectedNodes = treeView.getSelectedNodes(data);
  const title = '<b>Checked Items</b><br>'
  const itemDescription = (selectedNodes.length === 0)
    ? "No items are selected."
    : selectedNodes.map(node => node.text + '<br>').join('');
  $("#checked-items").html(`${title}${itemDescription}`);
}