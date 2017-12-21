const supportedFilenameExtensions = ['.jpeg', '.jpg', '.jpe', '.jfif', '.jfi', '.jif']; // JPEG extenions

exports.isSupportedFilenameExtension = function (filenameExtension) {
  return supportedFilenameExtensions.includes(filenameExtension);
};

exports.correctOrientation = function (srcBase64, srcOrientation) {
  return new Promise(function (resolve, reject) {
    const img = new Image();

    img.onload = function () {
      const width = img.width;
      const height = img.height;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // set proper canvas dimensions before transform & export
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // transform context before drawing image
      switch (srcOrientation) {
        case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, height, width); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
        default: break;
      }

      // draw image
      ctx.drawImage(img, 0, 0);

      // export base64
      resolve(canvas.toDataURL());
    };

    img.src = `data:image/jpg;base64,${srcBase64}`;
  });
};

