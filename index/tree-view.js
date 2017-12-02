const $ = require('jquery');
require('jstree');

const selectedDirectoryManager = require('../model/selected-directory-manager');

const treeView = $('#tree-view');

initialize();

function initialize() {
  treeView
    .on('changed.jstree', function (e, data) {
      cascadeDownSelectedState(data);
      exports.onChanged(data);
    })
    .jstree(
    {
      'core' : 
      {
        'data' : [/*No item at application launch.*/]
      },
    });
}

exports.update = function (selectedPath) {
  selectedDirectoryManager.update(selectedPath)
  .then(() => {
    const dataForJsTree = selectedDirectoryManager.generateDataForJsTree();
    treeView.jstree(true).settings.core.data = dataForJsTree;
    treeView.jstree(true).deselect_all(true);
    treeView.jstree(true).close_all();
    treeView.jstree(true).refresh();
  });
}

/**
 * Event to be fired when tree view is changed.
 * @param {*} data data property of jstree
 */
exports.onChanged = function(data){}; //Default event handler is assigned to avoid being undefined.

exports.getSelectedNodes = function(data) {
  var i, length, selectedNodes = [];
  for (i = 0, length = data.selected.length; i < length; i++) {
    const selectedNode = data.instance.get_node(data.selected[i]);
    selectedNodes.push(selectedNode);
  }
  return selectedNodes;
}

function cascadeDownSelectedState(data) {
  const selectedNodes = exports.getSelectedNodes(data);
  selectedNodes.forEach(node => selectChildrenRecursively(node));
}

function selectChildrenRecursively(parentNode) {
  parentNode.children
    .map(id => treeView.jstree(true).get_node(id))
    .filter(node => !node.state.disabled)
    .forEach(node => {
      treeView.jstree(true).select_node(node.id, "true", "true");
      selectChildrenRecursively(node);
    });
}