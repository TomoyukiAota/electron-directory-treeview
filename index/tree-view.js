const $ = require('jquery');
require('jstree');
const dirTree = require('directory-tree');

const treeView = $('#tree-view');

initialize();

function initialize() {
  treeView
    .on('changed.jstree', function (e, data) {
      exports.onChanged(data);
    })
    .jstree({
      'core' : {
        'data' : [
          { "text" : "Root node", 
            "children" : [
              { "text" : "Child node 1" },
              { "text" : "Child node 2",
                "state": {
                  "disabled"  : true
                },
              }
            ]
          }
        ]
      },
      "checkbox" : {
        "keep_selected_style" : false,
        "cascade_to_disabled" : false
      },
      "plugins" : [ "checkbox" ]
    });
}

exports.render = function (selectedPath) {
  const dataForJstree = getDataForJstree(selectedPath);
  treeView.jstree(true).settings.core.data = dataForJstree;
  treeView.jstree(true).refresh();
}

function getDataForJstree(selectedPath) {
  var dirTreeRoot = dirTree(selectedPath);
  if(!Array.isArray(dirTreeRoot)){
    dirTreeRoot = [dirTreeRoot];
  }
  return processDirTreeElementArray(dirTreeRoot);
}

function processDirTreeElementArray(dirTreeElementArray) {
  var jstreeElementArray = [];
  dirTreeElementArray.forEach(
    (dirTreeElement) => {
      var jstreeElement = {};
      jstreeElement.text = dirTreeElement.name;
      if(dirTreeElement.hasOwnProperty("children")) {
        jstreeElement.children = processDirTreeElementArray(dirTreeElement.children);
      }
      jstreeElementArray.push(jstreeElement);
    }
  );
  return jstreeElementArray;
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