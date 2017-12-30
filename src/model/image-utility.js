const supportedFilenameExtensions = ['.jpeg', '.jpg', '.jpe', '.jfif', '.jfi', '.jif']; // JPEG extenions

/**
 * Returns true if the specified filename extension is supported in this application.
 * @param {string} filenameExtension filename extension
 */
exports.isSupportedFilenameExtension = function (filenameExtension) {
  return supportedFilenameExtensions.includes(filenameExtension);
};

/**
 * Correct rotation of an image using EXIF orientation
 * @param {string} dataUrl data URL of the image to correct rotation
 * @param {number} orientation EXIF orientation
 * @returns rotated image
 */
exports.correctRotation = function (dataUrl, orientation) {
  return new Promise(function (resolve, reject) {
    const img = new Image();

    img.onload = function () {
      const srcWidth = img.width;
      const srcHeight = img.height;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const rotatedSize = exports.getRotatedSize(srcWidth, srcHeight, orientation);
      canvas.width = rotatedSize.width;
      canvas.height = rotatedSize.height;

      // transform context according to the specified orientation
      switch (orientation) {
        case 2: ctx.transform(-1, 0, 0, 1, srcWidth, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, srcWidth, srcHeight); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, srcHeight); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, srcHeight, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, srcHeight, srcWidth); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, srcWidth); break;
        default: break;
      }

      ctx.drawImage(img, 0, 0);
      resolve({
        dataUrl: canvas.toDataURL(),
        width: canvas.width,
        height: canvas.height
      });
    };

    img.src = dataUrl;
  });
};

/**
 * Get rotated width and height using EXIF orientation.
 * @param {number} srcWidth width to rotate
 * @param {number} srcHeight height to rotate
 * @param {number} orientation EXIF orientation
 */
exports.getRotatedSize = function (srcWidth, srcHeight, orientation) {
  let dstWidth, dstHeight;
  if (4 < orientation && orientation < 9) {
    dstWidth = srcHeight;
    dstHeight = srcWidth;
  } else {
    dstWidth = srcWidth;
    dstHeight = srcHeight;
  }
  return {
    width: dstWidth,
    height: dstHeight
  };
};
