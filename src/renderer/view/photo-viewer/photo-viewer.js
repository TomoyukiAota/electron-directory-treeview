const urlModule = require('url');

const imageUtility = require('../../model/image-utility');

const query = urlModule.parse(window.location.href, true).query;
const photo = JSON.parse(decodeURIComponent(query.photo));

console.log(`${photo.name} is opened.`);
console.log(photo);

async function showPhoto() {
  const rotatedPhoto = await imageUtility.correctRotation(photo.path, photo.orientation);
  const imgElement = document.createElement('img');
  imgElement.src = rotatedPhoto.dataUrl;
  imgElement.style.height = '100%';
  imgElement.style.width = '100%';
  imgElement.style.setProperty('object-fit', 'contain');
  document.body.appendChild(imgElement);
}

showPhoto();
