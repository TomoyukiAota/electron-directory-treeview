const $ = require('jquery');
require('jstree');
const dirTree = require('directory-tree');

initialize();

function initialize() {
  $('#tree-view').jstree({
    'core' : {
      'data' : [
        { "text" : "Root node", 
          "children" : [
            { "text" : "Child node 1" },
            { "text" : "Child node 2" }
          ]
        }
      ]
    }
  });
}

function render(selectedPath) {
  const dataForJstree = getDataForJstree(selectedPath);
  $('#tree-view').jstree(true).settings.core.data = dataForJstree;
  $('#tree-view').jstree(true).refresh();
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

module.exports = {
  render: render
}