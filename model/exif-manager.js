const fs = require('fs');

exports.update = function(directoryTreeRoot) {
  reset();
  addRecursively([directoryTreeRoot]);
}

function reset() {
  //TODO
}

function addRecursively(directoryTreeElementArray) {
  directoryTreeElementArray.forEach(
    (directoryTreeElement) => {
      add(directoryTreeElement.path);
      if(directoryTreeElement.hasOwnProperty("children")) {
        addRecursively(directoryTreeElement.children);
      }
    }
  )
}

function add() {
  //TODO
}