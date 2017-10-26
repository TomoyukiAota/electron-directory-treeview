// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const dir = require('node-dir');

$('#node-version').text(process.versions.node);
$('#chromium-version').text(process.versions.chrome);
$('#electron-version').text(process.versions.electron);

$('#select-directory-button').on('click', function (event) {
  ipc.send('open-file-dialog')
});

ipc.on('selected-directory', function (event, selectedPathArray) {
  const selectedPath = selectedPathArray[0];
  $('#selected-directory-area').text(`You selected: ${selectedPath}`);
  dir.paths(selectedPath, function(err, paths) {
    if (err) throw err;
    // console.log('files:\n',paths.files);
    // console.log('subdirs:\n', paths.dirs);
    const fileListString = paths.files.map(file => file + '<br>').join('');
    const fileListAreaHtml = `<p>Files: <br>${fileListString}<p/>`;
    const subDirListString = paths.dirs.map(dir => dir + '<br>').join('');
    const subDirListAreaHtml = `<p>Directories: <br>${subDirListString}<p/>`;
    $('#directory-list-area').html(`${fileListAreaHtml}${subDirListAreaHtml}`);
  });
});