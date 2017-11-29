const fs = require('fs');
const exifParser = require('exif-parser');

const imageUtility = require('./image-utility');

const pathExifPromisePairs = [];
const pathExifPairs = [];

exports.update = async function(directoryTreeRoot) {
  reset();
  fetchExifRecursively([directoryTreeRoot]);
  const promises = pathExifPromisePairs.map(
    pair => pair.exifPromise
    .then(exif => 
      pathExifPairs.push({
        path: pair.path,
        exif: exif
      })
    )
    .catch(() => {
      //Do nothing here. This just converts rejected promise into resolved ones.
      //This is required to wait for all promises including both resolved and rejected ones to be settled.
    })
  );
  await Promise.all(promises);
  console.log(pathExifPairs);
}

function reset() {
  pathExifPromisePairs.length = 0;
  pathExifPairs.length = 0;
}

function fetchExifRecursively(directoryTreeElementArray) {
  directoryTreeElementArray.forEach(
    (directoryTreeElement) => {
      fetchExif(directoryTreeElement);
      if(directoryTreeElement.hasOwnProperty("children")) {
        fetchExifRecursively(directoryTreeElement.children);
      }
    }
  )
}

function fetchExif(directoryTreeElement) {
  if(!imageUtility.isSupportedFilenameExtension(directoryTreeElement.extension))
    return;
  const pathExifPromisePair = {
    path: directoryTreeElement.path,
    exifPromise: instantiatePromiseToFetchExif(directoryTreeElement)
  }
  pathExifPromisePairs.push(pathExifPromisePair);
}

function instantiatePromiseToFetchExif(directoryTreeElement) {
  return new Promise(function(resolve, reject) {
    let exif;
    const bufferLengthRequiredToParseExif = 65635;
    const readStream = fs.createReadStream(directoryTreeElement.path, {start: 0, end: bufferLengthRequiredToParseExif - 1});  
    readStream.on('readable', () => {
      let buffer;
      while (null !== (buffer = readStream.read(bufferLengthRequiredToParseExif))) {
        console.log(`Fetched ${buffer.length} bytes of data from ${directoryTreeElement.name}`);
        exif = exifParser.create(buffer).parse();
        console.log(exif);
      }
    });
    readStream.on('end', () => {
      console.log(`Finished fetching data for ${directoryTreeElement.name}.`);
      resolve(exif);
    });
    readStream.on('error', () => {
      console.log(`Error occured when fetching data from ${directoryTreeElement.name}.`);
      reject();
    });
  });
}