const directoryTree = require('directory-tree');

const imageUtil = require('./image-utility');
const pathIdPairs = require('./path-id-pairs/path-id-pairs');
const pathIdPairsHandlerForTreeView = require('./path-id-pairs/path-id-pairs-handler-for-tree-view');
const exifManager = require('./exif-manager');

let directoryTreeRoot;

/**
 * Update selected directory to be managed in selected-directory-manager.
 * @param {string} selectedPath 
 */
exports.update = function(selectedPath) {
  directoryTreeRoot = directoryTree(selectedPath);
  updatePathIdPairs();
  exifManager.update(directoryTreeRoot);
}

function updatePathIdPairs() {
  pathIdPairs.reset();
  return updatePathIdPairsRecursively([directoryTreeRoot]);
}

function updatePathIdPairsRecursively(directoryTreeElementArray) {
  directoryTreeElementArray.forEach(
    (directoryTreeElement) => {
      pathIdPairs.registerPath(directoryTreeElement.path);
      if(directoryTreeElement.hasOwnProperty("children")) {
        updatePathIdPairsRecursively(directoryTreeElement.children);
      }
    }
  )
}

/**
 * Generate data for jsTree.
 */
exports.generateDataForJsTree = function() {
  return generateDataForJsTreeRecursively([directoryTreeRoot]);
}

function generateDataForJsTreeRecursively(directoryTreeElementArray) {
  var jstreeElementArray = [];
  directoryTreeElementArray.forEach(
    (directoryTreeElement) => {
      var jstreeElement = {
        id: pathIdPairsHandlerForTreeView.getIdForTreeView(directoryTreeElement.path),
        text: directoryTreeElement.name,
        state: { disabled: isDisabled(directoryTreeElement) }
      };
      if(directoryTreeElement.hasOwnProperty("children")) {
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
  const isFile = () => directoryTreeElement.type === "file";
  const isFilenameExtensionSupported = () => 
    imageUtil.isSupportedFilenameExtension(directoryTreeElement.extension);
  return isFile() && !isFilenameExtensionSupported();
}