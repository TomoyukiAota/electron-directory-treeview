const fs = require('fs');
const exifParser = require('exif-parser');
const _ = require('lodash');
const moment = require('moment-timezone');

const imageUtility = require('../../../shared/image-utility');

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
 * Gets the property of EXIF of the file.
 * If it does not exist, null (or the specified default value) is returned.
 * @param {string} filePath file path
 * @param {string} property property of EXIF
 * @param {any} defaultValue default value
 */
exports.getExifProperty = function (filePath, property, defaultValue = null) {
  return _.get(exports.getExif(filePath), property, defaultValue);
};

/**
 * Get GPS coordinates for the specified file if exists. If not, returns null.
 * @param {string} path file path
 */
exports.getGpsCoordinates = function (path) {
  const exif = exports.getExif(path);
  const gpsCoordinatesExist = _.has(exif, 'tags.GPSLatitude') && _.has(exif, 'tags.GPSLongitude');
  if (!gpsCoordinatesExist)
    return null;

  return {
    latitude: exif.tags.GPSLatitude,
    longitude: exif.tags.GPSLongitude
  };
};

/**
 * Get the thumbnail (Data URL, height, and width) of the specified file if exists.
 * If not, returns null.
 * @param {string} path file path
 */
exports.getThumbnail = async function (path) {
  const exif = exports.getExif(path);
  if (exif === null || !exif.hasThumbnail('image/jpeg'))
    return null;

  const buffer = exif.getThumbnailBuffer();
  const base64String = btoa(String.fromCharCode.apply(null, buffer));
  const dataUrl = `data:image/jpg;base64,${base64String}`;
  const rotated = await imageUtility.correctRotation(dataUrl, exif.tags.Orientation);
  return {
    dataUrl: rotated.dataUrl,
    height: rotated.height,
    width: rotated.width
  };
};

/**
 * Gets Moment instance from GPSDateStamp and GPSTimeStamp.
 * If they do not exist or exist in incorrect format, null is returned.
 * @param {string} path file path
 */
exports.getGpsDateTime = function (path) {
  const exif = exports.getExif(path);
  const gpsDateTimeExists = _.has(exif, 'tags.GPSDateStamp') && _.has(exif, 'tags.GPSTimeStamp');
  if (!gpsDateTimeExists)
    return null;

  const dateString = exif.tags.GPSDateStamp.replace(/:/g, '-');

  const time = exif.tags.GPSTimeStamp;
  const hour   = _.padStart(time[0], 2, '0');
  const minute = _.padStart(time[1], 2, '0');
  const second = _.padStart(time[2].toString().split('.')[0], 2, '0'); // GPSTimeStamp[2] has milisecond part after ".", but use the second part only.
  const timeString = `${hour}:${minute}:${second}`;

  // GPSDateStamp and/or GPSTimeStamp of some files are corrupted (such as 2014:10:281 for GPSDateStamp).
  // Therefore, check their formats and return null if they are invalid.
  moment.suppressDeprecationWarnings = true;
  const dateTime = moment.utc(`${dateString} ${timeString}`);
  moment.suppressDeprecationWarnings = false;
  return dateTime.isValid()
    ? dateTime
    : null;
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
