const exifManager = require('../model/exif-manager');
const dateTimeUtility = require('../model/date-time-utility');

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
