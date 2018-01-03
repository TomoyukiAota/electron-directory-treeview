const BrowserWindow = require('electron').remote.BrowserWindow; // eslint-disable-line import/no-extraneous-dependencies
const pathModule = require('path');
const urlModule = require('url');

const exifManager = require('../model/exif-manager');
const imageUtility = require('../../../shared/image-utility');

/**
 * Launches a photo viewer for the specified photo.
 * @param {*} photoInfo photo information from photo-info-generator.js
 */
exports.launch = async function (photoInfo) {
  const orientation = exifManager.getExifProperty(photoInfo.path, 'tags.Orientation');
  const originalWidth = exifManager.getExifProperty(photoInfo.path, 'imageSize.width');
  const originalHeight = exifManager.getExifProperty(photoInfo.path, 'imageSize.height');
  const rotatedSize = imageUtility.getRotatedSize(originalWidth, originalHeight, orientation);
  const shrinkedSize = shrinkSizeAccordingToScreen(rotatedSize.width, rotatedSize.height);

  // The instance in this photo variable will be URL-encoded and sent as a query parameter.
  // Also, there is a limit in URL length. (De facto limit is 2000 characters.)
  // Therefore, this instance cannot be large.
  // For example, this cannot include data URL of a photo.
  // See the below link for more infomation.
  // https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
  const photo = {
    name: photoInfo.name,
    path: photoInfo.path,
    orientation: orientation,
    width: Math.floor(shrinkedSize.width),
    height: Math.floor(shrinkedSize.height),
    latitude: photoInfo.latitude,
    longitude: photoInfo.longitude,
    dateTaken: photoInfo.dateTaken
  };

  const encodedPhoto = encodeURIComponent(JSON.stringify(photo));
  console.log(`Length of query component of URL for ${photo.name} window: ${encodedPhoto.length}`);

  const photoViewerUrl = urlModule.format({
    pathname: pathModule.join(__dirname, '../../photo-viewer/photo-viewer.html'),
    protocol: 'file:',
    slashes: true,
    query: { photo: encodedPhoto }
  });
  console.log(`URL length for ${photo.name} window: ${photoViewerUrl.length}`);

  let browerWindow = new BrowserWindow({
    title: photo.name,
    width: photo.width,
    height: photo.height,
    useContentSize: true
  });
  browerWindow.on('close', function () { browerWindow = null; });
  browerWindow.loadURL(photoViewerUrl);
  browerWindow.show();
};

function shrinkSizeAccordingToScreen(srcWidth, srcHeight) {
  const maxSrcToScreenRatio = 0.9;
  const srcToScreenWidthRatio = srcWidth / window.screen.width;
  const srcToScreenHeightRatio = srcHeight / window.screen.height;
  const srcToScreenLargerSideRatio = Math.max(srcToScreenWidthRatio, srcToScreenHeightRatio);

  if (srcToScreenLargerSideRatio <= maxSrcToScreenRatio) {
    return {
      width: srcWidth,
      height: srcHeight
    };
  }

  const shrinkRatio = maxSrcToScreenRatio / srcToScreenLargerSideRatio;
  const shrinkedWidth  = srcWidth  * shrinkRatio;
  const shrinkedHeight = srcHeight * shrinkRatio;
  return {
    width: shrinkedWidth,
    height: shrinkedHeight
  };
}
