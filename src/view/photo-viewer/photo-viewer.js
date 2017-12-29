const urlModule = require('url');

const query = urlModule.parse(window.location.href, true).query;
const photo = JSON.parse(decodeURIComponent(query.photo));

console.log(`${photo.name} is opened.`);
console.log(photo);

const imgElement = document.createElement('img');
imgElement.src = photo.path;
document.body.appendChild(imgElement);
