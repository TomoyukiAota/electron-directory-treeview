const assert = require('assert');

const infoWindowContentGenerator = require('../../../../src/renderer/main-window/view/info-window-content-generator');

describe('info-window-content-generator', function () {
  describe('createNameElement(photo)', function () {
    it('should return a DOM element for photo name.', function () {
      const photo = { name: "photo's name" };
      const element = infoWindowContentGenerator.createNameElement(photo);
      assert(element.style.textAlign  === 'center');
      assert(element.style.fontWeight === 'bold');
      assert(element.innerText        === photo.name);
    });
  });

  describe('createDateTakenElement(photo)', function () {
    it('should return a DOM element which has the date taken if it is available.', function () {
      const photo = { dateTaken: '2017/09/09 Sat 22:21:33' };
      const element = infoWindowContentGenerator.createDateTakenElement(photo);
      assert(element.style.textAlign  === 'center');
      assert(element.style.fontWeight === 'bold');
      assert(element.innerText        === photo.dateTaken);
    });

    it('should return a DOM element with unavailable massage if the date taken is not available.', function () {
      const photo = { dateTaken: null };
      const element = infoWindowContentGenerator.createDateTakenElement(photo);
      assert(element.style.textAlign  === 'center');
      assert(element.style.fontWeight === 'bold');
      assert(element.innerText        === 'Date taken is not available.');
    });
  });
});
