const assert = require('assert');

const pathIdPairs = require('../../../../../../src/renderer/main-window/model/path-id-pairs/path-id-pairs');

describe('path-id-pairs', function () {
  beforeEach('reset before each test', function () {
    pathIdPairs.reset();
  });

  describe('reset()', function () {
    it('should clear path-ID pairs.', function () {
      pathIdPairs.registerPath('C:\\Users\\ExampleUser\\Desktop');
      assert(pathIdPairs.getPairs().length === 1);
      pathIdPairs.reset();
      assert(pathIdPairs.getPairs().length === 0);
    });
  });

  describe('getPairs()', function () {
    it('should return no pair when pathes are not registered.', function () {
      assert(pathIdPairs.getPairs().length === 0);
    });

    it('should return 1 pair when 1 path is registered.', function () {
      pathIdPairs.registerPath('C:\\Users\\ExampleUser\\Desktop');
      assert(pathIdPairs.getPairs().length === 1);
    });
  });

  describe('registerPath()', function () {
    const path = 'C:\\Users\\ExampleUser\\Desktop';
    it('should register the path when it does not already exist.', function () {
      assert(pathIdPairs.registerPath(path) === true);
      assert(pathIdPairs.getPairs()[0].path === path);
    });

    it('should return false when the path is already registered.', function () {
      assert(pathIdPairs.registerPath(path) === true);
      assert(pathIdPairs.registerPath(path) === false);
    });
  });

  describe('getId()', function () {
    const path1 = 'C:\\Folder1';
    const path2 = 'C:\\Folder2';
    it('should return issued ID for the registered path.', function () {
      assert(pathIdPairs.registerPath(path1) === true);
      assert(pathIdPairs.getId(path1) === '0');
      assert(pathIdPairs.registerPath(path2) === true);
      assert(pathIdPairs.getId(path2) === '1');
    });

    it('should return null when the path is not registered.', function () {
      assert(pathIdPairs.registerPath(path1) === true);
      assert(pathIdPairs.getId(path2) === null);
    });
  });

  describe('getPath()', function () {
    const path1 = 'C:\\Folder1';
    const path2 = 'C:\\Folder2';
    it('should return the registered path from the issued ID.', function () {
      assert(pathIdPairs.registerPath(path1) === true);
      assert(pathIdPairs.getPath('0') === path1);
      assert(pathIdPairs.registerPath(path2) === true);
      assert(pathIdPairs.getPath('1') === path2);
    });

    it('should return null when a non-issued ID is specified.', function () {
      assert(pathIdPairs.registerPath(path1) === true);
      assert(pathIdPairs.getPath('1') === null);
    });
  });
});
