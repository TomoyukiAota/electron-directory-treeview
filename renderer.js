// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const dir = require('node-dir');
const dirTree = require('directory-tree');

require('./tree-view.js');

$('#node-version').text(process.versions.node);
$('#chromium-version').text(process.versions.chrome);
$('#electron-version').text(process.versions.electron);

$('#select-directory-button').on('click', function (event) {
  ipc.send('open-file-dialog');
});

ipc.on('selected-directory', function (event, selectedPathArray) {
  const selectedPath = selectedPathArray[0];
  $('#selected-directory-area').text(`You selected: ${selectedPath}`);
  renderDirectoryTreeArea(selectedPath);
  renderDirectoryListArea(selectedPath);
});

function renderDirectoryTreeArea(selectedPath) {
  const tree = dirTree(selectedPath);
  const description = '<p><b>JSON object by directory-tree module</b></p>';
  const stringifiedObject = JSON.stringify(tree, null, 1);
  $('#directory-tree-area').html(`${description}<pre>${stringifiedObject}</pre>`)
  console.log(tree);
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

$(document).ready(function(){
  $('#dragbar').mousedown(function(e){
    e.preventDefault();
    $(document).mousemove(function(e){
      $('.content').css("width",$(document).width()-e.pageX+2);
      $('.side-bar').css("width",e.pageX+2);
    })
  });
  $(document).mouseup(function(e){
    $(document).unbind('mousemove');
  });
});