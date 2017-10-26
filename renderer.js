// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require('jquery');
const ipc = require('electron').ipcRenderer;

$('#node-version').text(process.versions.node);
$('#chromium-version').text(process.versions.chrome);
$('#electron-version').text(process.versions.electron);

$('#select-directory-button').on('click', function (event) {
  ipc.send('open-file-dialog')
});

ipc.on('selected-directory', function (event, path) {
  $('#selected-directory-area').text(`You selected: ${path}`);
});