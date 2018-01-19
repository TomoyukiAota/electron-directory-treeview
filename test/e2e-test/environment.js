const pathModule = require('path');
const Application = require('spectron').Application;
const electron = require('electron');

const rootDir = pathModule.join(__dirname, '../..');

function getSpectronApp() {
  return new Application({
    path: electron,
    args: [rootDir]
  });
}

module.exports = {
  getSpectronApp: getSpectronApp
};
