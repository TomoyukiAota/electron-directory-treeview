const supportedFilenameExtensions = ['.jpeg', '.jpg', '.jpe', '.jfif', '.jfi', '.jif']; // JPEG extenions

exports.isSupportedFilenameExtension = function (filenameExtension) {
  return supportedFilenameExtensions.includes(filenameExtension);
};
