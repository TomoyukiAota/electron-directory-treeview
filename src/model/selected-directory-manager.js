const directoryTree = require('directory-tree');
const _ = require('lodash');

const pathIdPairs = require('./path-id-pairs/path-id-pairs');
const pathIdPairsHandlerForTreeView = require('./path-id-pairs/path-id-pairs-handler-for-tree-view');
const exifManager = require('./exif-manager');

let directoryTreeRoot;

/**
 * Update selected directory to be managed in selected-directory-manager.
 * @param {string} selectedPath
 */
exports.update = async function (selectedPath) {
  directoryTreeRoot = directoryTree(selectedPath);
  updatePathIdPairs();
  await exifManager.update(directoryTreeRoot);
};

function updatePathIdPairs() {
  pathIdPairs.reset();
  return updatePathIdPairsRecursively([directoryTreeRoot]);
}

function updatePathIdPairsRecursively(directoryTreeElementArray) {
  directoryTreeElementArray.forEach(
    directoryTreeElement => {
      pathIdPairs.registerPath(directoryTreeElement.path);
      if (_.has(directoryTreeElement, 'children')) {
        updatePathIdPairsRecursively(directoryTreeElement.children);
      }
    }
  );
}

/**
 * Generate data for jsTree.
 */
exports.generateDataForJsTree = function () {
  return generateDataForJsTreeRecursively([directoryTreeRoot]);
};

function generateDataForJsTreeRecursively(directoryTreeElementArray) {
  const jstreeElementArray = [];
  directoryTreeElementArray.forEach(
    directoryTreeElement => {
      const jstreeElement = {
        id: pathIdPairsHandlerForTreeView.getIdForTreeView(directoryTreeElement.path),
        text: directoryTreeElement.name,
        state: { disabled: isDisabled(directoryTreeElement) }
      };
      if (_.has(directoryTreeElement, 'children')) {
        jstreeElement.children = generateDataForJsTreeRecursively(directoryTreeElement.children);
        const isAllChildrenDisabled = jstreeElement.children.every(child => child.state.disabled);
        jstreeElement.state.disabled = isAllChildrenDisabled;
      }
      jstreeElementArray.push(jstreeElement);
    }
  );
  return jstreeElementArray;
}

function isDisabled(directoryTreeElement) {
  const isFile = directoryTreeElement.type === 'file';
  const gpsCoordinatesExist = exifManager.getGpsCoordinates(directoryTreeElement.path) !== null;
  return isFile && !gpsCoordinatesExist;
}
