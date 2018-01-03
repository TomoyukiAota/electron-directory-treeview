const exifManager = require('../model/exif-manager');
const photoDateTakenGenerator = require('../model/photo-date-taken-generator');

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
    dateTaken: photoDateTakenGenerator.generate(path)
  };
};
