const fs = require('fs');
const exifParser = require('exif-parser');

const imageUtility = require('./image-utility');

exports.update = function(directoryTreeRoot) {
  reset();
  addRecursively([directoryTreeRoot]);
}

function reset() {
  //TODO
}

function addRecursively(directoryTreeElementArray) {
  directoryTreeElementArray.forEach(
    (directoryTreeElement) => {
      add(directoryTreeElement);
      if(directoryTreeElement.hasOwnProperty("children")) {
        addRecursively(directoryTreeElement.children);
      }
    }
  )
}

function add(directoryTreeElement) {
  if(!imageUtility.isSupportedFilenameExtension(directoryTreeElement.extension))
    return;

  const bufferLengthRequiredToParseExif = 65635;
  const readStream = fs.createReadStream(directoryTreeElement.path, {start: 0, end: bufferLengthRequiredToParseExif - 1});
  readStream.on('readable', () => {
    let buffer;
    while (null !== (buffer = readStream.read(bufferLengthRequiredToParseExif))) {
      console.log(`Fetched ${buffer.length} bytes of data from ${directoryTreeElement.name}`);
      const exifResult = exifParser.create(buffer).parse();
      console.log(exifResult);
    }
  });
  readStream.on('end', () => {
    console.log(`Finished fetching data for ${directoryTreeElement.name}.`);
  });
}