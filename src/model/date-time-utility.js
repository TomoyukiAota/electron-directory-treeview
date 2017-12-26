const moment = require('moment-timezone');

const exifManager = require('./exif-manager');

exports.getDateTime = function (path) {
  // No support for time zone using GPSDateStamp and GPSTimeStamp.
  // This is because GPSDateStamp does not exist in old cameras like iPhone 4 and 5,
  // so a large number of photos cannot support time zone.
  // Also, time zone is not really neccessary feature because photos' local time is enough.
  // return getGpsDateTime(path) || getDateTimeOriginal(path);

  // Therefore, use EXIF's DateTimeOriginal property which is saved in local time when the photo was taken.
  return getDateTimeOriginal(path);
};


// When supporting time zone, use the function below.
/**
 * Gets formatted date and time from GPSDateStamp and GPSTimeStamp.
 * These EXIF properties are saved in UTC, so time zone is applied.
 * If they do not exist or exist in incorrect format, null is returned.
 * @param {string} path file path
 */
// eslint-disable-next-line no-unused-vars
function getGpsDateTime(path) {
  const gpsDateTime = exifManager.getGpsDateTime(path);
  if (!gpsDateTime)
    return null;

  const timeZone = moment.tz.guess();
  const formattedGpsDateTime = gpsDateTime.tz(timeZone).format('YYYY/MM/DD ddd HH:mm:ss');
  const formattedTimeZone = moment.tz(timeZone).format('z');
  return `${formattedGpsDateTime} (${formattedTimeZone})`;
}

function getDateTimeOriginal(path) {
  // DateTimeOriginal in EXIF is recorded in unix timestamp format but in local time when the photo was taken.
  // Also, moment.js guesses time zone and formats time using the guessed time zone.
  // So, formatting the local time using guessed time zone results in extra conversion which gives incorrect time.
  // In order to just use the local time avoiding such conversion,
  // the time zone of Moment instance is set to UTC because no conversion will occur when UTC time zone is used.
  const dateTimeOriginal = exifManager.getExifProperty(path, 'tags.DateTimeOriginal');
  if (!dateTimeOriginal)
    return null;

  return moment.unix(dateTimeOriginal).tz('UTC').format('YYYY/MM/DD ddd HH:mm:ss');
}
