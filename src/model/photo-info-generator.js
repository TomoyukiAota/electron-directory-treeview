const exifManager = require('../model/exif-manager');
const dateTimeUtility = require('../model/date-time-utility');

/**
 * Generates information related to the photo specified by the path.
 * @param {string} name photo name
 * @param {string} path file path
 */
exports.generate = async function (name, path) {
  const gpsCoordinates = exifManager.getGpsCoordinates(path);
  return {
    name: name,
    path: path,
    latitude: gpsCoordinates.latitude,
    longitude: gpsCoordinates.longitude,
    thumbnail: await exifManager.getThumbnail(path),
    dateTime: dateTimeUtility.getDateTime(path)
  };
};
