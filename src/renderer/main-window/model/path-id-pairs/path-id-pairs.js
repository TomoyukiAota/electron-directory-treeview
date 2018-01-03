let pairs = [];
let id = 0;

function issueId() {
  return (id++).toString();
}

/**
 * Clear all registered pairs. After this function call, ID will be issued from 0 again.
 */
exports.reset = function () {
  pairs = [];
  id = 0;
};

/**
 * Returns path-ID pairs.
 */
exports.getPairs = function () {
  return pairs;
};

/**
 * Register path. A unique ID will be generated and paired with the path.
 * @param {string} path path to register
 * @returns {boolean} false if the path is already registered.
 */
exports.registerPath = function (path) {
  if (pairs.some(element => element.path === path))
    return false;

  const newElement = {
    path: path,
    id: issueId()
  };
  pairs.push(newElement);
  return true;
};

/**
 * Get the ID from the specified path.
 * @param {string} path path
 * @return {string} If path is registered, returns the ID. If not, returns null.
 */
exports.getId = function (path) {
  const elements = pairs.filter(element => element.path === path);
  if (elements.length === 1)
    return elements[0].id;

  if (elements.length === 0)
    return null;

  throw new Error(`More than 2 elements are registered for ${path}.`);
};

/**
 * Get the path from the specified ID.
 * @param {string} id ID
 * @return {string} If the ID is an issued one, returns the path. If not, returns null.
 */
exports.getPath = function (id) {
  const elements = pairs.filter(element => element.id === id);
  if (elements.length === 1)
    return elements[0].path;

  if (elements.length === 0)
    return null;

  throw new Error(`More than 2 elements are registered for ${id}.`);
};
