const pathIdPairs = require('./path-id-pairs');

const idPrefix = "tv-";

/**
 * Register the specified path and get issued ID for tree view.
 * @param {string} path path
 */
exports.issueIdForTreeView = function(path) {
  pathIdPairs.registerPath(path);
  return exports.getIdForTreeView(path);
}

/**
 * Get the ID for tree view from the specified path.
 * @param {string} path path
 * @return {string} If the path is registered, returns the ID. If not, returns null.
 */
exports.getIdForTreeView = function(path) {
  const id = pathIdPairs.getId(path);
  return id === null
    ? null
    : `${idPrefix}${id}`;
}

/**
 * Get the path from the specified ID for tree view.
 * @param {string} idForTreeView ID for tree view
 * @return {string} If the ID is registered, returns the path. If not, returns null.
 */
exports.getPath = function(idForTreeView) {
  const id = idForTreeView.split(idPrefix)[1];
  return pathIdPairs.getPath(id);
}