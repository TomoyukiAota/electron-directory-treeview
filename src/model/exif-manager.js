const fs = require('fs');
const exifParser = require('exif-parser');
const _ = require('lodash');

const imageUtility = require('./image-utility');

const exifPromises = [];
const pathExifPairs = [];
const exifFetchError = 'Error occured when fetching EXIF.';

/**
 * Update exif-manager using the specified root of directory tree.
 * @param {*} directoryTreeRoot the root of directory tree
 */
exports.update = async function (directoryTreeRoot) {
  reset();
  addExifPromiseRecursively([directoryTreeRoot]);
  await Promise.all(exifPromises);
  console.log(pathExifPairs);
};

/**
 * Get EXIF for the specified file if exists. If not, returns null.
 * @param {string} path file path
 */
exports.getExif = function (path) {
  const pair = pathExifPairs.find(pair => pair.path === path);
  return pair && pair.exif !== exifFetchError
    ? pair.exif
    : null;
};

/**
 * Get GPS coordinates for the specified file if exists. If not, returns null.
 * @param {string} path file path
 */
exports.getGpsCoordinates = function (path) {
  const exif = exports.getExif(path);
  if (exif === null || !_.has(exif, 'tags'))
    return null;

  const gpsCoordinatesExist = _.has(exif.tags, 'GPSLatitude') && _.has(exif.tags, 'GPSLongitude');
  if (!gpsCoordinatesExist)
    return null;

  return {
    latitude: exif.tags.GPSLatitude,
    longitude: exif.tags.GPSLongitude
  };
};

/**
 * Get thumbnail (Base64-encoded string of the image, height, and width) of the specified file if exists.
 * If not, returns null.
 * @param {string} path file path
 */
exports.getThumbnail = async function (path) {
  const exif = exports.getExif(path);
  if (exif === null || !exif.hasThumbnail('image/jpeg'))
    return null;

  const buffer = exif.getThumbnailBuffer();
  const base64Encoded = btoa(String.fromCharCode.apply(null, buffer));
  const size = exif.getThumbnailSize();
  const rotated = await imageUtility.correctOrientation(base64Encoded, exif.tags.Orientation);
  return {
    base64: rotated,
    height: size.height,
    width: size.width
  };
};

function reset() {
  exifPromises.length = 0;
  pathExifPairs.length = 0;
}

function addExifPromiseRecursively(directoryTreeElementArray) {
  directoryTreeElementArray.forEach(
    directoryTreeElement => {
      addExifPromise(directoryTreeElement);
      if (_.has(directoryTreeElement, 'children')) {
        addExifPromiseRecursively(directoryTreeElement.children);
      }
    }
  );
}

function addExifPromise(directoryTreeElement) {
  if (!imageUtility.isSupportedFilenameExtension(directoryTreeElement.extension))
    return;

  const promise = instantiatePromiseToFetchExif(directoryTreeElement)
    .then(exif =>
      pathExifPairs.push({
        path: directoryTreeElement.path,
        exif: exif
      })
    )
    .catch(() =>
      pathExifPairs.push({
        path: directoryTreeElement.path,
        exif: exifFetchError
      })
    );

  exifPromises.push(promise);
}

function instantiatePromiseToFetchExif(directoryTreeElement) {
  return new Promise(function (resolve, reject) {
    let exif;
    const bufferLengthRequiredToParseExif = 65635;
    const readStream = fs.createReadStream(
      directoryTreeElement.path,
      {start: 0, end: bufferLengthRequiredToParseExif - 1});
    readStream.on('readable', () => {
      let buffer;
      while (null !== (buffer = readStream.read(bufferLengthRequiredToParseExif))) {
        console.log(`Fetched ${buffer.length} bytes of data from ${directoryTreeElement.name}`);
        try {
          exif = exifParser.create(buffer).parse();
        } catch (error) {
          console.log(`Unable to parse EXIF information of ${directoryTreeElement.name}`);
        }
      }
    });
    readStream.on('end', () => {
      if (!exif) {
        reject();
        return;
      }

      console.log(`Finished fetching data for ${directoryTreeElement.name}.`);
      console.log(exif);
      resolve(exif);
    });
    readStream.on('error', () => {
      console.log(`Error occured when fetching data from ${directoryTreeElement.name}.`);
      reject();
    });
  });
}
