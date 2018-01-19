const os = require('os');
const pathModule = require('path');
const Application = require('spectron').Application;
const electron = require('electron');

const rootDir = pathModule.join(__dirname, '../..');

function getElectronLocation() {
  const electronModuleDir = pathModule.join(rootDir, 'node_modules/electron');
  const electronBinaryLocation
    = pathModule.join(electronModuleDir, getElectronBinaryLocationRelativeToElectronModuleDir());
  return electronBinaryLocation;
}

function getElectronBinaryLocationRelativeToElectronModuleDir() {
  const platform = process.env.npm_config_platform || os.platform();

  switch (platform) {
    case 'darwin':
      return 'dist/Electron.app/Contents/MacOS/Electron';
    case 'freebsd':
    case 'linux':
      return 'dist/electron';
    case 'win32':
      return 'dist/electron.exe';
    default:
      throw new Error(`Electron builds are not available on platform: ${platform}`);
  }
}

const electronLocation = getElectronLocation();

function getSpectronApp() {
  return new Application({
    path: electron,
    args: [rootDir]
  });
}

module.exports = {
  getSpectronApp: getSpectronApp
};
